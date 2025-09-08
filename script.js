const items = {
  Common: ["Ancient Tome", "Silver Arrow"],
  Rare: ["Shadow Cloak", "Mystic Orb"],
  Epic: ["Crystal Blade", "Dragon Scale"],
  Legendary: ["Phoenix Feather", "Golden Chalice"]
};

const rarities = [
  { name: "Common", class: "common", chance: 60 },
  { name: "Rare", class: "rare", chance: 25 },
  { name: "Epic", class: "epic", chance: 10 },
  { name: "Legendary", class: "legendary", chance: 5 }
];

// roll for rarity based on chances
function getRarity() {
  const roll = Math.random() * 100;
  let cumulative = 0;
  for (let rarity of rarities) {
    cumulative += rarity.chance;
    if (roll <= cumulative) return rarity;
  }
  return rarities[0]; // fallback
}

// pick a random word within the chosen rarity
function getRandomWord(rarityName) {
  const pool = items[rarityName];
  return pool[Math.floor(Math.random() * pool.length)];
}

document.getElementById("generateBtn").addEventListener("click", () => {
  const rarity = getRarity();
  const word = getRandomWord(rarity.name);
  const resultDiv = document.getElementById("result");

  resultDiv.innerHTML = `<span class="${rarity.class}">${word} (${rarity.name})</span>`;
});
