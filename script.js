const items = [
  { name: "Conrad", rarity: "Common", chance: 50 },
  { name: "Mustarddd", rarity: "Common", chance: 25 },
  { name: "6 or 7", rarity: "Rare", chance: 15 },
  { name: "Energetic Harvey", rarity: "Rare", chance: 10 },
  { name: "Conrads Mum", rarity: "Epic", chance: 7 },
  { name: "Sigma Boy", rarity: "Epic", chance: 5 },
  { name: "Dumb Owen", rarity: "Legendary", chance: 2 },
  { name: "Coolboy Alyan", rarity: "Legendary", chance: 1 },
  { name: "Molested Conrad", rarity: "Mythic", chance: 0.5 },
  { name: "ZOINNNNN", rarity: "Mythic", chance: 0.4 }
];

const rarities = {
  Common: { class: "common", rank: 1 },
  Rare: { class: "rare", rank: 2 },
  Epic: { class: "epic", rank: 3 },
  Legendary: { class: "legendary", rank: 4 },
  Mythic: { class: "mythic", rank: 5 }
};

const INVENTORY_LIMIT = 5;

// Load data from localStorage
let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || {};
let bestWord = JSON.parse(localStorage.getItem("bestWord")) || null;
let inventory = JSON.parse(localStorage.getItem("inventory")) || {};
let autoRollActive = JSON.parse(localStorage.getItem("autoRollActive")) || false; // New: Auto roll state
let autoRollFilterRarity = localStorage.getItem("autoRollFilterRarity") || "none"; // New: Auto roll filter

let autoRollInterval = null; // To store the interval ID for auto roll

// Helper to get rarity rank
function getRarityRank(rarityName) {
  return rarities[rarityName] ? rarities[rarityName].rank : 0;
}

// Random item with normalized chance - now with filter support
function getRandomItem(filterRarityRank = 0) {
  const availableItems = items.filter(item => getRarityRank(item.rarity) > filterRarityRank);

  if (availableItems.length === 0) {
    console.warn("No items available after filtering!");
    return null; // No items to roll for
  }

  const total = availableItems.reduce((sum, item) => sum + item.chance, 0);
  let roll = Math.random() * total;

  for (let item of availableItems) {
    if (roll < item.chance) {
      return {
        ...item,
        normalizedChance: ((item.chance / total) * 100).toFixed(2)
      };
    }
    roll -= item.chance;
  }

  // Fallback, should ideally not be reached if availableItems is not empty
  return { ...availableItems[0], normalizedChance: ((availableItems[0].chance / total) * 100).toFixed(2) };
}

// Sparkles
function createSparkles(parent, count = 10) {
  parent.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const sparkle = document.createElement("div");
    sparkle.className = "sparkle";
    sparkle.style.left = `${Math.random() * parent.offsetWidth}px`;
    sparkle.style.top = `${Math.random() * parent.offsetHeight}px`;
    parent.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 1000);
  }
}

// Update leaderboard display
function updateLeaderboard(word = null, rarity = null) {
  if (word) {
    leaderboard[word] = (leaderboard[word] || 0) + 1;

    if (!bestWord || !bestWord.rarity || getRarityRank(rarity) > getRarityRank(bestWord.rarity)) {
      bestWord = { word, rarity };
    }

    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
    localStorage.setItem("bestWord", JSON.stringify(bestWord));
  }

  const lbDiv = document.getElementById("leaderboard");
  let html = "<h3>Leaderboard</h3>";

  if (bestWord && bestWord.word && bestWord.rarity) {
    const bestRarityInfo = rarities[bestWord.rarity];
    if (bestRarityInfo) {
      html += `<div><strong>Best Word:</strong> <span class="${bestRarityInfo.class}">${bestWord.word} (${bestWord.rarity})</span></div>`;
    }
  }

  const sortedWords = Object.keys(leaderboard).sort((a, b) => leaderboard[b] - leaderboard[a]);

  sortedWords.forEach(wordKey => {
    const itemInfo = items.find(i => i.name === wordKey);
    if (itemInfo) {
      const r = itemInfo.rarity;
      const rarityInfo = rarities[r];
      if (rarityInfo) {
        html += `
  <div class="leaderboard-item ${rarityInfo.class}">
    <span>${wordKey}</span>
    <span class="item-count">${leaderboard[wordKey]}</span>
  </div>`
      }
    }
  });

  lbDiv.innerHTML = html;
}

// Function to remove an item from inventory
function removeItemFromInventory(itemName) {
  if (inventory[itemName]) {
    inventory[itemName].count--;
    if (inventory[itemName].count <= 0) {
      delete inventory[itemName];
    }
    localStorage.setItem("inventory", JSON.stringify(inventory));
    updateInventory();
  }
}

// Update Inventory Display
function updateInventory(item = null) {
  let inventoryUpdated = false;
  if (item) {
    const currentUniqueItems = Object.keys(inventory).length;
    if (inventory[item.name] || currentUniqueItems < INVENTORY_LIMIT) {
      if (inventory[item.name]) {
        inventory[item.name].count++;
      } else {
        inventory[item.name] = {
          rarity: item.rarity,
          count: 1
        };
      }
      localStorage.setItem("inventory", JSON.stringify(inventory));
      inventoryUpdated = true;
    } else {
      console.log(`Inventory is full (${INVENTORY_LIMIT} unique items)! Cannot add "${item.name}".`);
      // Optionally provide visual feedback to the user here
    }
  }

  const invDiv = document.getElementById("inventory");
  let html = "<h3>Inventory</h3>";

  const sortedInventoryItems = Object.keys(inventory).sort((a, b) => {
    const rarityA = getRarityRank(inventory[a].rarity);
    const rarityB = getRarityRank(inventory[b].rarity);
    if (rarityA !== rarityB) {
      return rarityB - rarityA;
    }
    return inventory[b].count - inventory[a].count;
  });

  if (sortedInventoryItems.length === 0) {
    html += "<p>Your inventory is empty.</p>";
  } else {
    sortedInventoryItems.forEach(itemName => {
      const itemData = inventory[itemName];
      const rarityInfo = rarities[itemData.rarity];
      if (rarityInfo) {
        html += `
          <div class="inventory-item ${rarityInfo.class}">
            <span>${itemName}</span>
            <span class="item-count">x${itemData.count}</span>
            <button class="remove-item-btn" data-item-name="${itemName}">X</button>
          </div>
        `;
      }
    });
  }

  invDiv.innerHTML = html;

  // Add event listeners for remove buttons after rendering
  invDiv.querySelectorAll(".remove-item-btn").forEach(button => {
    button.addEventListener("click", (event) => {
      const itemName = event.target.dataset.itemName;
      removeItemFromInventory(itemName);
    });
  });

  return inventoryUpdated; // Return if an item was successfully added/stacked
}


// --- Main Rolling Logic (can be called by button or auto-roll) ---
function performRoll() {
  const filterValue = document.getElementById("rarityFilter").value;
  let filterRank = 0;
  if (filterValue !== "none") {
    filterRank = getRarityRank(filterValue);
  }

  const item = getRandomItem(filterRank);

  if (!item) {
    document.getElementById("item-display").innerHTML = `<span class="common">No items available with current filter!</span>`;
    return; // Stop if no items can be rolled
  }

  const rarityInfo = rarities[item.rarity];
  const itemDisplayDiv = document.getElementById("item-display");
  const sparkleContainer = document.getElementById("sparkle-container");

  itemDisplayDiv.innerHTML = `
    <span class="${rarityInfo.class} float">
      ${item.name} (${item.rarity}) - ${item.normalizedChance}% odds
    </span>
  `;

  if (item.rarity === "Epic") createSparkles(sparkleContainer, 10);
  if (item.rarity === "Legendary") createSparkles(sparkleContainer, 20);
  if (item.rarity === "Mythic") createSparkles(sparkleContainer, 30); // More sparkles for Mythic!

  updateLeaderboard(item.name, item.rarity);
  const inventoryAdded = updateInventory(item);

  // If auto-roll is on and inventory is full with non-stackable item, stop auto-roll.
  // We check inventoryAdded to see if the item was actually added/stacked.
  if (autoRollActive && !inventoryAdded && !inventory[item.name]) {
    toggleAutoRoll(false); // Turn off auto-roll
    alert(`Auto-roll stopped: Inventory is full (${INVENTORY_LIMIT} unique items) and cannot add "${item.name}".`);
  }
}

// --- Auto Roll Functions ---
function startAutoRoll() {
  if (autoRollInterval) return; // Prevent multiple intervals
  autoRollInterval = setInterval(performRoll, 1000); // Roll every 1 second
  document.getElementById("generateBtn").disabled = true; // Disable manual button
  console.log("Auto Roll Started");
}

function stopAutoRoll() {
  if (autoRollInterval) {
    clearInterval(autoRollInterval);
    autoRollInterval = null;
    document.getElementById("generateBtn").disabled = false; // Re-enable manual button
    console.log("Auto Roll Stopped");
  }
}

function toggleAutoRoll(forceState = undefined) {
  const toggleCheckbox = document.getElementById("autoRollToggle");
  if (forceState !== undefined) {
    autoRollActive = forceState;
    toggleCheckbox.checked = forceState;
  } else {
    autoRollActive = toggleCheckbox.checked;
  }

  if (autoRollActive) {
    startAutoRoll();
  } else {
    stopAutoRoll();
  }
  localStorage.setItem("autoRollActive", JSON.stringify(autoRollActive));
}


// --- Event Listeners ---
document.getElementById("generateBtn").addEventListener("click", performRoll);

document.getElementById("autoRollToggle").addEventListener("change", () => {
  toggleAutoRoll();
});

document.getElementById("rarityFilter").addEventListener("change", (event) => {
  autoRollFilterRarity = event.target.value;
  localStorage.setItem("autoRollFilterRarity", autoRollFilterRarity);
  // If auto-roll is active, and filter changes, might want to re-evaluate the next roll
  // For simplicity, just ensures the next roll uses the new filter.
});


// --- Initialization on Load ---
document.addEventListener("DOMContentLoaded", () => {
  // Set initial state of auto-roll toggle and filter dropdown
  const autoRollToggleElem = document.getElementById("autoRollToggle");
  const rarityFilterElem = document.getElementById("rarityFilter");

  autoRollToggleElem.checked = autoRollActive;
  rarityFilterElem.value = autoRollFilterRarity;

  // Initialize auto-roll if it was active on last visit
  if (autoRollActive) {
    toggleAutoRoll(true);
  }

  updateLeaderboard();
  updateInventory();
});
