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
let autoRollActive = JSON.parse(localStorage.getItem("autoRollActive")) || false;
let autoRollFilterRarity = localStorage.getItem("autoRollFilterRarity") || "none";

let autoRollInterval = null;
let isRolling = false; // New: Flag to prevent multiple rolls during a skip animation

// Helper to get rarity rank
function getRarityRank(rarityName) {
  return rarities[rarityName] ? rarities[rarityName].rank : 0;
}

// Random item (now always from the full list, filtering logic moved to performRoll)
function getRandomItem() {
  const total = items.reduce((sum, item) => sum + item.chance, 0);
  let roll = Math.random() * total;

  for (let item of items) {
    if (roll < item.chance) {
      return {
        ...item,
        normalizedChance: ((item.chance / total) * 100).toFixed(2)
      };
    }
    roll -= item.chance;
  }
  return { ...items[0], normalizedChance: ((items[0].chance / total) * 100).toFixed(2) };
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
      // No alert here, performRoll handles auto-roll stopping now.
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

  invDiv.querySelectorAll(".remove-item-btn").forEach(button => {
    button.addEventListener("click", (event) => {
      const itemName = event.target.dataset.itemName;
      removeItemFromInventory(itemName);
    });
  });

  return inventoryUpdated;
}


// --- Main Rolling Logic ---
async function performRoll() {
  if (isRolling) return; // Prevent new rolls while one is in progress
  isRolling = true;

  const filterValue = document.getElementById("rarityFilter").value;
  const filterRank = getRarityRank(filterValue); // Rank of rarity to filter out (and below)

  const item = getRandomItem(); // Always get from the full list now
  const itemRarityRank = getRarityRank(item.rarity);

  const rarityInfo = rarities[item.rarity];
  const itemDisplayDiv = document.getElementById("item-display");
  const sparkleContainer = document.getElementById("sparkle-container");

  // Display the rolled item
  itemDisplayDiv.innerHTML = `
    <span class="${rarityInfo.class} float">
      ${item.name} (${item.rarity}) - ${item.normalizedChance}% odds
    </span>
  `;

  if (item.rarity === "Epic") createSparkles(sparkleContainer, 10);
  if (item.rarity === "Legendary") createSparkles(sparkleContainer, 20);
  if (item.rarity === "Mythic") createSparkles(sparkleContainer, 30);

  // Check if the item should be filtered out
  const shouldSkip = autoRollActive && filterValue !== "none" && itemRarityRank <= filterRank;

  if (shouldSkip) {
    console.log(`Auto-roll skipped: "${item.name}" (${item.rarity}) filtered out.`);
    // Briefly show the item, then roll again quickly
    await new Promise(resolve => setTimeout(resolve, 500)); // Show for 0.5 seconds
    isRolling = false; // Allow next roll
    if (autoRollActive) { // If auto-roll is still active, trigger next roll immediately
      performRoll();
    }
  } else {
    // If not skipped, add to inventory and leaderboard
    updateLeaderboard(item.name, item.rarity);
    const inventoryAdded = updateInventory(item);

    // If auto-roll is on and inventory is full with non-stackable item, stop auto-roll.
    if (autoRollActive && !inventoryAdded && !inventory[item.name]) {
      toggleAutoRoll(false); // Turn off auto-roll
      alert(`Auto-roll stopped: Inventory is full (${INVENTORY_LIMIT} unique items) and cannot add "${item.name}".`);
    }

    isRolling = false; // Allow next roll after normal interval
  }
}

// --- Auto Roll Functions ---
function startAutoRoll() {
  if (autoRollInterval) return;
  autoRollInterval = setInterval(performRoll, 1000);
  document.getElementById("generateBtn").disabled = true;
  console.log("Auto Roll Started");
}

function stopAutoRoll() {
  if (autoRollInterval) {
    clearInterval(autoRollInterval);
    autoRollInterval = null;
    document.getElementById("generateBtn").disabled = false;
    console.log("Auto Roll Stopped");
  }
  isRolling = false; // Reset isRolling flag when stopped
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
  // No need to reset auto-roll, next roll will use new filter.
});


// --- Initialization on Load ---
document.addEventListener("DOMContentLoaded", () => {
  const autoRollToggleElem = document.getElementById("autoRollToggle");
  const rarityFilterElem = document.getElementById("rarityFilter");

  autoRollToggleElem.checked = autoRollActive;
  rarityFilterElem.value = autoRollFilterRarity;

  if (autoRollActive) {
    toggleAutoRoll(true); // Start auto-roll if it was active
  }

  updateLeaderboard();
  updateInventory();
});
