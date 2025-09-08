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

// Retrieve leaderboard and best word from localStorage
let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || {};
let bestWord = JSON.parse(localStorage.getItem("bestWord")) || null;

function getRandomItem() {
  const total = items.reduce((sum, item) => sum + item.chance, 0);
  let roll = Math.random() * total;

  for (let item of items) {
    if (roll < item.chance) {
      return item;
    }
    roll -= item.chance;
  }

  return items[0]; // fallback
}

// Floating animation sparkles
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

// Update leaderboard
function updateLeaderboard(word, rarity) {
  // increment word count
  if (!leaderboard[word]) leaderboard[word] = 0;
  leaderboard[word]++;

  // update best word by rarity rank
  if (!bestWord || rarities[rarity].rank > rarities[bestWord.rarity].rank) {
    bestWord = { word, rarity };
  }

  // save to localStorage
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  localStorage.setItem("bestWord", JSON.stringify(bestWord));

  // update leaderboard display
  const lbDiv = document.getElementById("leaderboard");
  const sortedWords = Object.keys(leaderboard).sort((a,b) => leaderboard[b] - leaderboard[a]);
  
  let html = `<div><strong>Best Word:</strong> <span class="${rarities[bestWord.rarity].class}">${bestWord.word} (${bestWord.rarity})</span></div>`;
  html += sortedWords.map(word => {
    const r = items.find(i => i.name === word).rarity;
    return `<div class="leaderboard-item ${rarities[r].class}">${word}: ${leaderboard[word]}</div>`;
  }).join("");
  lbDiv.innerHTML = html;
}

document.getElementById("generateBtn").addEventListener("click", () => {
  const item = getRandomItem();
  const rarityInfo = rarities[item.rarity];
  const resultDiv = document.getElementById("result");

  resultDiv.innerHTML = `
    <span class="${rarityInfo.class} float">
      ${item.name} (${item.rarity})
    </span>
  `;

  // Sparkles for Epic / Legendary
  if (item.rarity === "Epic") createSparkles(resultDiv, 10);
  if (item.rarity === "Legendary") createSparkles(resultDiv, 20);

  // Update leaderboard
  updateLeaderboard(item.name, item.rarity);
});

// initialize leaderboard on load
updateLeaderboard("", "");
