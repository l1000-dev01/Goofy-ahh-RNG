const items = [
  { name: "Ancient Tome", rarity: "Common", chance: 50 },
  { name: "Silver Arrow", rarity: "Common", chance: 25 },
  { name: "Shadow Cloak", rarity: "Rare", chance: 15 },
  { name: "Mystic Orb", rarity: "Rare", chance: 10 },
  { name: "Crystal Blade", rarity: "Epic", chance: 7 },
  { name: "Dragon Scale", rarity: "Epic", chance: 5 },
  { name: "Phoenix Feather", rarity: "Legendary", chance: 2 },
  { name: "Golden Chalice", rarity: "Legendary", chance: 1 }
];

const rarities = {
  Common: { class: "common", rank: 1 },
  Rare: { class: "rare", rank: 2 },
  Epic: { class: "epic", rank: 3 },
  Legendary: { class: "legendary", rank: 4 }
};

// Load leaderboard and best word
let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || {};
let bestWord = JSON.parse(localStorage.getItem("bestWord")) || null;

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
  // Clear any existing sparkles before adding new ones
  parent.innerHTML = '';

  for (let i = 0; i < count; i++) {
    const sparkle = document.createElement("div");
    sparkle.className = "sparkle";
    // Position within the sparkle-container
    sparkle.style.left = `${Math.random() * parent.offsetWidth}px`;
    sparkle.style.top = `${Math.random() * parent.offsetHeight}px`;
    parent.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 1000); // Sparkles disappear after 1 second
  }
}

// Update leaderboard display
function updateLeaderboard(word = null, rarity = null) {
  if (word) {
    leaderboard[word] = (leaderboard[word] || 0) + 1;

    // Ensure bestWord is initialized correctly if it's the first word or has missing properties
    if (!bestWord || !bestWord.rarity || rarities[rarity].rank > rarities[bestWord.rarity].rank) {
      bestWord = { word, rarity };
    }

    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
    localStorage.setItem("bestWord", JSON.stringify(bestWord));
  }

  const lbDiv = document.getElementById("leaderboard");
  let html = "<h3>Leaderboard</h3>";

  // Display Best Word
  if (bestWord && bestWord.word && bestWord.rarity) {
    const bestRarityInfo = rarities[bestWord.rarity];
    if (bestRarityInfo) {
      html += `<div><strong>Best Word:</strong> <span class="${bestRarityInfo.class}">${bestWord.word} (${bestWord.rarity})</span></div>`;
    }
  }

  // Display all leaderboard items, sorted by count
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
});

// Initialize leaderboard on load
updateLeaderboard();
