import { BANK } from './data.js';

const LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const STORAGE_KEY = 'impostor-game-state-v1';

const setupScreen = document.getElementById('setupScreen');
const revealScreen = document.getElementById('revealScreen');
const playerInput = document.getElementById('playerInput');
const impostorInput = document.getElementById('impostorInput');
const languageSelect = document.getElementById('languageSelect');
const levelSelect = document.getElementById('levelSelect');
const startGameBtn = document.getElementById('startGame');
const resetGameBtn = document.getElementById('resetGame');
const setupError = document.getElementById('setupError');
const categoryDisplay = document.getElementById('categoryDisplay');
const languageDisplay = document.getElementById('languageDisplay');
const levelDisplay = document.getElementById('levelDisplay');
const playersList = document.getElementById('playersList');
const newRoundBtn = document.getElementById('newRound');
const editPlayersBtn = document.getElementById('editPlayers');
const hardResetBtn = document.getElementById('hardReset');

const modal = document.getElementById('modal');
const modalPrompt = document.getElementById('modalPrompt');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const revealButton = document.getElementById('revealButton');
const hideButton = document.getElementById('hideButton');

let state = {
  players: [],
  impostorCount: 1,
  impostorIndexes: [],
  category: '',
  word: '',
  revealed: [],
  language: 'en',
  level: 'A1',
};

let currentPlayerIndex = null;
let hideTimer = null;

function availableLevelsForLanguage(language) {
  const levelMap = BANK[language] || {};
  const levels = Object.keys(levelMap);
  return LEVEL_ORDER.filter((level) => levels.includes(level));
}

function populateLevelOptions(language, desiredLevel) {
  const levels = availableLevelsForLanguage(language);
  levelSelect.innerHTML = '';

  if (!levels.length) {
    return;
  }

  levels.forEach((level) => {
    const option = document.createElement('option');
    option.value = level;
    option.textContent = level;
    levelSelect.appendChild(option);
  });

  const selectedLevel = levels.includes(desiredLevel) ? desiredLevel : levels[0];
  levelSelect.value = selectedLevel;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return;
  try {
    const parsed = JSON.parse(stored);
    if (parsed && Array.isArray(parsed.players)) {
      const language = parsed.language || state.language;
      const level = parsed.level || state.level;
      state = { ...state, ...parsed, language, level };
      populateLevelOptions(language, level);
      impostorInput.value = state.impostorCount || 1;
      playerInput.value = state.players.join('\n');
      languageSelect.value = language;
      levelSelect.value = level;
      renderReveal();
      switchScreen('reveal');
    }
  } catch (err) {
    console.warn('Could not load saved game', err);
  }
}

function switchScreen(screen) {
  if (screen === 'reveal') {
    setupScreen.classList.add('hidden');
    revealScreen.classList.remove('hidden');
  } else {
    revealScreen.classList.add('hidden');
    setupScreen.classList.remove('hidden');
  }
}

function parseNames(raw) {
  const lines = raw
    .split(/\r?\n/)
    .map((n) => n.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  const counts = new Map();
  return lines.map((name) => {
    const lower = name.toLowerCase();
    const count = counts.get(lower) || 0;
    counts.set(lower, count + 1);
    return count === 0 ? name : `${name} (${count + 1})`;
  });
}

function randomCategoryAndWord() {
  const levelBank = BANK[state.language]?.[state.level];
  if (!levelBank) {
    throw new Error('No bank found for selected language and level');
  }

  const categories = Object.keys(levelBank);
  const category = categories[Math.floor(Math.random() * categories.length)];
  const words = levelBank[category];
  const word = words[Math.floor(Math.random() * words.length)];
  return { category, word };
}

function pickImpostors(count, total) {
  const indexes = Array.from({ length: total }, (_, i) => i);
  for (let i = indexes.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
  }
  return indexes.slice(0, count);
}

function startGame() {
  const players = parseNames(playerInput.value);
  const impostorCount = Number(impostorInput.value);
  const language = languageSelect.value;
  const level = levelSelect.value;

  if (players.length < 3) {
    setupError.textContent = 'Please enter at least 3 players.';
    return;
  }

  if (!Number.isInteger(impostorCount) || impostorCount < 1 || impostorCount >= players.length) {
    setupError.textContent = 'Impostors must be at least 1 and fewer than players.';
    return;
  }

  const levelBank = BANK[language]?.[level];
  if (!levelBank) {
    setupError.textContent = 'No words available for that language and level.';
    return;
  }

  state.language = language;
  state.level = level;

  const { category, word } = randomCategoryAndWord();
  const impostorIndexes = pickImpostors(impostorCount, players.length);

  state = {
    players,
    impostorCount,
    impostorIndexes,
    category,
    word,
    revealed: new Array(players.length).fill(false),
    language,
    level,
  };

  setupError.textContent = '';
  saveState();
  renderReveal();
  switchScreen('reveal');
}

function renderReveal() {
  categoryDisplay.textContent = state.category || 'Not started yet';
  languageDisplay.textContent = state.language.toUpperCase();
  levelDisplay.textContent = state.level;
  playersList.innerHTML = '';

  state.players.forEach((player, index) => {
    const card = document.createElement('div');
    card.className = 'player-card';

    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = player;
    button.className = 'player-name' + (state.revealed[index] ? ' revealed' : '');
    button.disabled = state.revealed[index];
    button.addEventListener('click', () => openModal(index));

    const status = document.createElement('span');
    status.className = 'status' + (state.revealed[index] ? ' checked' : '');
    status.textContent = state.revealed[index] ? '✓ Revealed' : 'Waiting';

    card.appendChild(button);
    card.appendChild(status);
    playersList.appendChild(card);
  });
}

function openModal(index) {
  currentPlayerIndex = index;
  modal.classList.remove('hidden');
  modalPrompt.textContent = `Pass the device to:`;
  modalTitle.textContent = state.players[index];
  showRevealPrompt();
}

function closeModal() {
  modal.classList.add('hidden');
  currentPlayerIndex = null;
  clearTimeout(hideTimer);
}

function showRevealPrompt() {
  clearTimeout(hideTimer);
  modalBody.innerHTML = '';
  modalBody.appendChild(revealButton);
  revealButton.classList.remove('hidden');
  hideButton.classList.add('hidden');
}

function showResult() {
  const index = currentPlayerIndex;
  if (index === null) return;
  const isImpostor = state.impostorIndexes.includes(index);

  const body = document.createElement('div');
  const role = document.createElement('p');
  role.textContent = isImpostor ? 'You ARE the impostor.' : 'You are NOT the impostor.';
  role.style.fontWeight = '700';
  body.appendChild(role);

  const category = document.createElement('p');
  category.textContent = `Category: ${state.category}`;
  body.appendChild(category);

  if (!isImpostor) {
    const word = document.createElement('p');
    word.textContent = `Secret word: ${state.word}`;
    body.appendChild(word);
  }

  modalBody.innerHTML = '';
  modalBody.appendChild(body);

  hideButton.classList.remove('hidden');
  state.revealed[index] = true;
  renderReveal();
  saveState();

  hideTimer = setTimeout(() => {
    showRevealPrompt();
  }, 10000);
}

function newRound() {
  if (!state.players.length) return;
  const { category, word } = randomCategoryAndWord();
  const impostorIndexes = pickImpostors(state.impostorCount, state.players.length);
  state = {
    ...state,
    category,
    word,
    impostorIndexes,
    revealed: new Array(state.players.length).fill(false),
  };
  saveState();
  renderReveal();
}

function hardReset() {
  localStorage.removeItem(STORAGE_KEY);
  state = {
    players: [],
    impostorCount: 1,
    impostorIndexes: [],
    category: '',
    word: '',
    revealed: [],
    language: 'en',
    level: 'A1',
  };
  playerInput.value = '';
  impostorInput.value = 1;
  languageSelect.value = 'en';
  populateLevelOptions('en', 'A1');
  switchScreen('setup');
  renderReveal();
}

function populateSetup() {
  playerInput.value = state.players.join('\n');
  impostorInput.value = state.impostorCount;
  languageSelect.value = state.language;
  populateLevelOptions(state.language, state.level);
  setupError.textContent = '';
}

startGameBtn.addEventListener('click', startGame);
resetGameBtn.addEventListener('click', () => {
  playerInput.value = '';
  impostorInput.value = 1;
  setupError.textContent = '';
});

newRoundBtn.addEventListener('click', () => {
  closeModal();
  newRound();
});

editPlayersBtn.addEventListener('click', () => {
  closeModal();
  populateSetup();
  switchScreen('setup');
});

languageSelect.addEventListener('change', () => {
  populateLevelOptions(languageSelect.value, levelSelect.value);
});

hardResetBtn.addEventListener('click', () => {
  closeModal();
  hardReset();
});

revealButton.addEventListener('click', showResult);
hideButton.addEventListener('click', () => {
  showRevealPrompt();
});

modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    closeModal();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
  }
});

populateLevelOptions(state.language, state.level);
loadState();
