const words = [
  "Crystal Blade", "Shadow Cloak", "Phoenix Feather", "Ancient Tome",
  "Dragon Scale", "Mystic Orb", "Silver Arrow", "Golden Chalice"
];

const rarities = [
  { name: "Common", class: "common", chance: 60 },
  { name: "Rare", class: "rare", chance: 25 },
  { name: "Epic", class: "epic", chance: 10 },
  { name: "Legendary", class: "legendary", chance: 5 }
];

function getRandomWord() {
  return words[Math.floor(Math.random() * words.length)];
}

function getRarity() {
  const roll = Math.random() * 100;
  let cumulative = 0;
  for (let rarity of rarities) {
    cumulative += rarity.chance;
    if (roll <= cumulative) return rarity;
  }
  return rarities[0]; // fallback
}

document.getElementById('generateBtn').addEventListener('click', () => {
  const word = getRandomWord();
  const rarity = getRarity();
  const resultDiv = document.getElementById('result');
  resultDiv.textContent = `${word} (${rarity.name})`;
  resultDiv.className = `result ${rarity.class}`;
});
