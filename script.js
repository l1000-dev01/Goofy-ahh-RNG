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

const INVENTORY_LIMIT = 5; // New: Define inventory limit

// Load leaderboard, best word, and inventory
let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || {};
let bestWord = JSON.parse(localStorage.getItem("bestWord")) || null;
let inventory = JSON.parse(localStorage.getItem("inventory")) || {};

// Random item with normalized chance
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

  // Fallback in case floating point arithmetic causes issues, should return the first item
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

    if (!bestWord || !bestWord.rarity || rarities[rarity].rank > rarities[bestWord.rarity].rank) {
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

// New: Function to remove an item from inventory
function removeItemFromInventory(itemName) {
  if (inventory[itemName]) {
    inventory[itemName].count--;
    if (inventory[itemName].count <= 0) {
      delete inventory[itemName]; // Remove item if count is zero or less
    }
    localStorage.setItem("inventory", JSON.stringify(inventory));
    updateInventory(); // Re-render inventory after removal
  }
}

// Update Inventory Display
function updateInventory(item = null) {
  if (item) {
    const currentUniqueItems = Object.keys(inventory).length;
    // Check if item already exists, or if there's space for a new unique item
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
    } else {
      // Notify user if inventory is full and item is not stackable
      alert(`Inventory is full (${INVENTORY_LIMIT} unique items)! Cannot add "${item.name}".`);
    }
  }

  const invDiv = document.getElementById("inventory");
  let html = "<h3>Inventory</h3>";

  const sortedInventoryItems = Object.keys(inventory).sort((a, b) => {
    const rarityA = rarities[inventory[a].rarity].rank;
    const rarityB = rarities[inventory[b].rarity].rank;
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
}


// Generate button
document.getElementById("generateBtn").addEventListener("click", () => {
  const item = getRandomItem();
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

  updateLeaderboard(item.name, item.rarity);
  updateInventory(item);
});

// Initialize leaderboard and inventory on load
updateLeaderboard();
updateInventory();
