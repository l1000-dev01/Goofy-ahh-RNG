document.getElementById('generateBtn').addEventListener('click', () => {
  const randomNumber = Math.floor(Math.random() * 100) + 1;
  document.getElementById('result').textContent = randomNumber;
});
