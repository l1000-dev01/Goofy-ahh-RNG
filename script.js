const items = [
  { name: "Crystal Blade", rarity: "Epic" },
  { name: "Shadow Cloak", rarity: "Rare" },
  { name: "Phoenix Feather", rarity: "Legendary" },
  { name: "Ancient Tome", rarity: "Common" },
  { name: "Dragon Scale", rarity: "Epic" },
  { name: "Mystic Orb", rarity: "Rare" },
  { name: "Silver Arrow", rarity: "Common" },
  { name: "Golden Chalice", rarity: "Legendary" }
];

// rarity styles
const rarities = {
  Common: { class: "common" },
  Rare: { class: "rare" },
  Epic: { class: "epic" },
  Legendary: { class: "legendary" }
};

function getRandomItem() {
  return items[Math.floor(Math.random() * items.length)];
}

document.getElementById("generateBtn").addEventListener("click", () => {
  const item = getRandomItem();
  const rarityInfo = rarities[item.rarity];
  const resultDiv = document.getElementById("result");

  resultDiv.innerHTML = `<span class="${rarityInfo.class}">${item.name} (${item.rarity})</span>`;
});
