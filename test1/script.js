const screen1 = document.getElementById('screen1');
const screen2 = document.getElementById('screen2');
const sentence1 = document.getElementById('sentence1');
const echo = document.getElementById('echo');
const hmm = document.getElementById('hmm');
const whyBox = document.getElementById('whyBox');
const choiceButtons = [document.getElementById('same'), document.getElementById('different'), document.getElementById('unsure')];

document.getElementById('submit1').addEventListener('click', () => {
  echo.textContent = sentence1.value;
  screen1.classList.remove('visible');
  screen1.classList.add('hidden');
  screen2.classList.remove('hidden');
  screen2.classList.add('visible');
});

function selectChoice(button) {
  choiceButtons.forEach((b) => b.classList.toggle('chosen', b === button));
}

function showHmm(button) {
  selectChoice(button);
  hmm.classList.remove('hidden');
  whyBox.classList.add('hidden');
}

function showWhy(button) {
  selectChoice(button);
  whyBox.classList.remove('hidden');
  hmm.classList.add('hidden');
}

document.getElementById('same').addEventListener('click', (e) => showHmm(e.currentTarget));
document.getElementById('unsure').addEventListener('click', (e) => showHmm(e.currentTarget));
document.getElementById('different').addEventListener('click', (e) => showWhy(e.currentTarget));
