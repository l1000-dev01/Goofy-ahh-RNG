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

// rarity -> class mapping
const rarities = {
  Common: { class: "common" },
  Rare: { class: "rare" },
  Epic: { class: "epic" },
  Legendary: { class: "legendary" }
};

// weighted random by item chance, returns normalizedChance too
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

  // fallback (shouldn't happen)
  const fallback = items[0];
  return {
    ...fallback,
    normalizedChance: ((fallback.chance / total) * 100).toFixed(2)
  };
}

document.getElementById("generateBtn").addEventListener("click", () => {
  const item = getRandomItem();
  const rarityInfo = rarities[item.rarity];
  const resultDiv = document.getElementById("result");

  // Put the floated span inside the result; float class handles animation.
  resultDiv.innerHTML = `
    <span class="${rarityInfo.class} float">
      ${item.name} (${item.rarity}) - ${item.normalizedChance}% odds
    </span>
  `;
});
