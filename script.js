const items = [
  { name: "Ancient Tome", rarity: "Common", chance: 30 },
  { name: "Silver Arrow", rarity: "Common", chance: 30 },
  { name: "Shadow Cloak", rarity: "Rare", chance: 15 },
  { name: "Mystic Orb", rarity: "Rare", chance: 10 },
  { name: "Crystal Blade", rarity: "Epic", chance: 7 },
  { name: "Dragon Scale", rarity: "Epic", chance: 5 },
  { name: "Phoenix Feather", rarity: "Legendary", chance: 2 },
  { name: "Golden Chalice", rarity: "Legendary", chance: 1 }
];

// rarity styles
const rarities = {
  Common: { class: "common" },
  Rare: { class: "rare" },
  Epic: { class: "epic" },
  Legendary: { class: "legendary" }
};

// weighted random by item chance
function getRandomItem() {
  const total = items.reduce((sum, item) => sum + item.chance, 0);
  let roll = Math.random() * total;

  for (let item of items) {
    if (roll < item.chance) return item;
    roll -= item.chance;
  }

  return items[0]; // fallback
}

document.getElementById("generateBtn").addEventListener("click", () => {
  const item = getRandomItem();
  const rarityInfo = rarities[item.rarity];
  const resultDiv = document.getElementById("result");

  resultDiv.innerHTML = `
    <span class="${rarityInfo.class}">
      ${item.name} (${item.rarity}) - ${item.chance}% odds
    </span>
  `;
});
