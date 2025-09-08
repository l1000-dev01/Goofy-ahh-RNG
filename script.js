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

  return { ...items[0], normalizedChance: ((items[0].chance / total) * 100).toFixed(2) };
}

// Sparkles
function createSparkles(parent, count = 10) {
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

    // Ensure bestWord is initialized correctly if it's the first word
    if (!bestWord || !bestWord.rarity || rarities[rarity].rank > rarities[bestWord.rarity].rank) {
      bestWord = { word, rarity };
    }

    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
    localStorage.setItem("bestWord", JSON.stringify(bestWord));
  }

  const lbDiv = document.getElementById("leaderboard");
  let html = "<h3>Leaderboard</h3>";

  if (bestWord && bestWord.word && bestWord.rarity) { // Add checks for bestWord properties
    const bestRarityInfo = rarities[bestWord.rarity];
    if (bestRarityInfo) { // Ensure rarity info exists
      html += `<div><strong>Best Word:</strong> <span class="${bestRarityInfo.class}">${bestWord.word} (${bestWord.rarity})</span></div>`;
    }
  }

  // Sort the leaderboard and then build the list
  const sortedWords = Object.keys(leaderboard).sort((a, b) => leaderboard[b] - leaderboard[a]);

  sortedWords.forEach(wordKey => {
    // Safely find the item to get its rarity
    const itemInfo = items.find(i => i.name === wordKey);
    if (itemInfo) { // Only display if the item is found
      const r = itemInfo.rarity;
      const rarityInfo = rarities[r];
      if (rarityInfo) { // Ensure rarity info exists
        html += `<div class="leaderboard-item ${rarityInfo.class}">${wordKey}: ${leaderboard[wordKey]}</div>`;
      }
    } else {
      // Optional: Handle words in localStorage that are no longer in 'items'
      // console.warn(`Leaderboard contains an item not in current 'items' list: ${wordKey}`);
      // If you want to display them anyway without rarity styling:
      // html += `<div class="leaderboard-item">${wordKey}: ${leaderboard[wordKey]}</div>`;
    }
  });

  lbDiv.innerHTML = html;
}

// Generate button
document.getElementById("generateBtn").addEventListener("click", () => {
  const item = getRandomItem();
  const rarityInfo = rarities[item.rarity];
  const resultDiv = document.getElementById("result");

  resultDiv.innerHTML = `
    <span class="${rarityInfo.class} float">
      ${item.name} (${item.rarity}) - ${item.normalizedChance}% odds
    </span>
  `;

  if (item.rarity === "Epic") createSparkles(resultDiv, 10);
  if (item.rarity === "Legendary") createSparkles(resultDiv, 20);

  updateLeaderboard(item.name, item.rarity);
});

// Initialize leaderboard on load
updateLeaderboard();
