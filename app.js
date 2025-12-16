import { fetchWordBank } from './data.js';

const LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const STORAGE_KEY = 'impostor-game-state-v2';

const setupScreen = document.getElementById('setupScreen');
const revealScreen = document.getElementById('revealScreen');
const playerInput = document.getElementById('playerInput');
const impostorInput = document.getElementById('impostorInput');
const languageSelect = document.getElementById('languageSelect');
const levelCheckboxes = document.getElementById('levelCheckboxes');
const categoryCheckboxes = document.getElementById('categoryCheckboxes');
const wordSourceStatus = document.getElementById('wordSourceStatus');
const startGameBtn = document.getElementById('startGame');
const resetGameBtn = document.getElementById('resetGame');
const setupError = document.getElementById('setupError');
const categoryDisplay = document.getElementById('categoryDisplay');
const languageDisplay = document.getElementById('languageDisplay');
const levelDisplay = document.getElementById('levelDisplay');
const categoryFiltersDisplay = document.getElementById('categoryFiltersDisplay');
const playersList = document.getElementById('playersList');
const newRoundBtn = document.getElementById('newRound');
const editPlayersBtn = document.getElementById('editPlayers');
const hardResetBtn = document.getElementById('hardReset');
const showImpostorsBtn = document.getElementById('showImpostors');

const modal = document.getElementById('modal');
const modalPrompt = document.getElementById('modalPrompt');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const revealButton = document.getElementById('revealButton');
const hideButton = document.getElementById('hideButton');
const startPlayerDisplay = document.getElementById('startPlayerDisplay');
const impostorReveal = document.getElementById('impostorReveal');

let state = {
  players: [],
  impostorCount: 1,
  impostorIndexes: [],
  category: '',
  word: '',
  revealed: [],
  language: 'en',
  selectedLevels: [],
  selectedCategories: [],
  startPlayerIndex: null,
};

let latestBank = {};
let bankPromise = null;
let currentPlayerIndex = null;
let hideTimer = null;
let shouldResumeReveal = false;

function allPlayersRevealed() {
  return state.revealed.length > 0 && state.revealed.every(Boolean);
}

function clearImpostorReveal() {
  impostorReveal.textContent = '';
  impostorReveal.classList.add('hidden');
}

function normalizeLanguage(language) {
  return (language || '').trim();
}

function availableLevelsForLanguage(language) {
  const normalized = normalizeLanguage(language);
  const levelMap = latestBank[normalized] || {};
  const levels = Object.keys(levelMap);
  const ordered = LEVEL_ORDER.filter((level) => levels.includes(level));
  const leftovers = levels.filter((level) => !ordered.includes(level)).sort();
  return [...ordered, ...leftovers];
}

function availableCategories(language, levels) {
  const normalized = normalizeLanguage(language);
  const categories = new Set();
  levels.forEach((level) => {
    const levelBank = latestBank[normalized]?.[level];
    if (!levelBank) return;
    Object.keys(levelBank).forEach((category) => categories.add(category));
  });
  return Array.from(categories).sort();
}

function renderLanguageOptions(selectedLanguage) {
  languageSelect.innerHTML = '';
  const languages = Object.keys(latestBank);
  languages.sort((a, b) => a.localeCompare(b));

  languages.forEach((lang) => {
    const option = document.createElement('option');
    option.value = lang;
    option.textContent = lang;
    languageSelect.appendChild(option);
  });

  const desired = languages.includes(selectedLanguage) ? selectedLanguage : languages[0];
  languageSelect.value = desired;
}

function renderLevelCheckboxes(language, preferredLevels = []) {
  const levels = availableLevelsForLanguage(language);
  levelCheckboxes.innerHTML = '';

  if (!levels.length) return [];

  const selection = preferredLevels.length
    ? preferredLevels.filter((level) => levels.includes(level))
    : levels;

  levels.forEach((level) => {
    const id = `level-${level}`;
    const wrapper = document.createElement('label');
    wrapper.className = 'pill-option';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = level;
    input.id = id;
    input.checked = selection.includes(level);
    input.className = 'hidden-input';
    const badge = document.createElement('span');
    badge.className = 'pill-badge';
    badge.textContent = level;
    wrapper.appendChild(input);
    wrapper.appendChild(badge);
    levelCheckboxes.appendChild(wrapper);
  });

  return selection;
}

function renderCategoryCheckboxes(language, levels, preferredCategories = []) {
  const categories = availableCategories(language, levels);
  categoryCheckboxes.innerHTML = '';
  if (!categories.length) return [];

  const selection = preferredCategories.length
    ? preferredCategories.filter((category) => categories.includes(category))
    : categories;

  categories.forEach((category) => {
    const id = `category-${category}`;
    const wrapper = document.createElement('label');
    wrapper.className = 'pill-option';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = category;
    input.id = id;
    input.checked = selection.includes(category);
    input.className = 'hidden-input';
    const badge = document.createElement('span');
    badge.className = 'pill-badge';
    badge.textContent = category;
    wrapper.appendChild(input);
    wrapper.appendChild(badge);
    categoryCheckboxes.appendChild(wrapper);
  });

  return selection;
}

function describeSelection(values) {
  if (!values.length) return 'None selected';
  return values.join(', ');
}

function updateFilterSummaries() {
  levelDisplay.textContent = describeSelection(state.selectedLevels);
  categoryFiltersDisplay.textContent = describeSelection(state.selectedCategories);
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
      state = {
        ...state,
        ...parsed,
        language: parsed.language || state.language,
        selectedLevels: parsed.selectedLevels || [],
        selectedCategories: parsed.selectedCategories || [],
      };

      impostorInput.value = state.impostorCount || 1;
      playerInput.value = state.players.join('\n');
      shouldResumeReveal = state.players.length > 0;
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

function buildWordPool() {
  const languageBank = latestBank[normalizeLanguage(state.language)];
  if (!languageBank) return [];

  const pool = [];

  state.selectedLevels.forEach((level) => {
    const levelBank = languageBank[level];
    if (!levelBank) return;

    state.selectedCategories.forEach((category) => {
      const words = levelBank[category];
      if (!words || !words.length) return;
      words.forEach((word) => {
        pool.push({ category, word });
      });
    });
  });

  return pool;
}

function randomCategoryAndWord() {
  const pool = buildWordPool();
  if (!pool.length) {
    throw new Error('No words available for the selected filters.');
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

function pickImpostors(count, total) {
  const indexes = Array.from({ length: total }, (_, i) => i);
  for (let i = indexes.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
  }
  return indexes.slice(0, count);
}

function pickStartingPlayer(total) {
  if (total <= 0) return null;
  return Math.floor(Math.random() * total);
}

async function startGame() {
  const players = parseNames(playerInput.value);
  const impostorCount = Number(impostorInput.value);
  const language = languageSelect.value;

  try {
    await refreshWordBank();
  } catch (err) {
    setupError.textContent = err.message;
    return;
  }

  const selectedLevels = Array.from(levelCheckboxes.querySelectorAll('input[type="checkbox"]'))
    .filter((input) => input.checked)
    .map((input) => input.value)
    .filter((level) => availableLevelsForLanguage(language).includes(level));
  const selectedCategories = Array.from(categoryCheckboxes.querySelectorAll('input[type="checkbox"]'))
    .filter((input) => input.checked)
    .map((input) => input.value)
    .filter((category) => availableCategories(language, selectedLevels).includes(category));

  if (players.length < 3) {
    setupError.textContent = 'Please enter at least 3 players.';
    return;
  }

  if (!Number.isInteger(impostorCount) || impostorCount < 1 || impostorCount >= players.length) {
    setupError.textContent = 'Impostors must be at least 1 and fewer than players.';
    return;
  }

  if (!selectedLevels.length) {
    setupError.textContent = 'Choose at least one level.';
    return;
  }

  if (!selectedCategories.length) {
    setupError.textContent = 'Choose at least one category.';
    return;
  }

  state.language = language;
  state.selectedLevels = selectedLevels;
  state.selectedCategories = selectedCategories;

  const pool = buildWordPool();
  if (!pool.length) {
    setupError.textContent = 'No words available for that language, level, and category combination.';
    return;
  }

  const { category, word } = randomCategoryAndWord();
  const impostorIndexes = pickImpostors(impostorCount, players.length);
  const startPlayerIndex = pickStartingPlayer(players.length);

  state = {
    players,
    impostorCount,
    impostorIndexes,
    category,
    word,
    revealed: new Array(players.length).fill(false),
    language,
    selectedLevels,
    selectedCategories,
    startPlayerIndex,
  };

  setupError.textContent = '';
  saveState();
  renderReveal();
  switchScreen('reveal');
}

function renderReveal() {
  categoryDisplay.textContent = state.category || 'Not started yet';
  languageDisplay.textContent = state.language.toUpperCase();
  levelDisplay.textContent = describeSelection(state.selectedLevels);
  categoryFiltersDisplay.textContent = describeSelection(state.selectedCategories);
  const startingPlayer =
    typeof state.startPlayerIndex === 'number' && state.players[state.startPlayerIndex]
      ? state.players[state.startPlayerIndex]
      : 'No player selected yet';
  startPlayerDisplay.textContent = startingPlayer;
  playersList.innerHTML = '';

  state.players.forEach((player, index) => {
    const card = document.createElement('div');
    const isStarter = state.startPlayerIndex === index;
    card.className = 'player-card' + (isStarter ? ' starter' : '');

    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = player;
    button.className =
      'player-name' +
      (state.revealed[index] ? ' revealed' : '') +
      (isStarter ? ' starter' : '');
    button.disabled = state.revealed[index];
    button.addEventListener('click', () => openModal(index));

    const status = document.createElement('span');
    status.className = 'status' + (state.revealed[index] ? ' checked' : '');
    const starterLabel = isStarter ? ' • Starts' : '';
    status.textContent = state.revealed[index] ? `✓ Revealed${starterLabel}` : `Waiting${starterLabel}`;

    card.appendChild(button);
    card.appendChild(status);
    playersList.appendChild(card);
  });

  const everyoneRevealed = allPlayersRevealed();
  showImpostorsBtn.disabled = !everyoneRevealed;

  if (!everyoneRevealed) {
    clearImpostorReveal();
  }
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

function revealImpostorsToGroup() {
  if (!state.players.length || !allPlayersRevealed()) return;

  const confirmed = window.confirm(
    'Are you sure you want to see who the impostor(s) are? This will reveal them to everyone.'
  );

  if (!confirmed) return;

  const impostorNames = state.impostorIndexes.map((index) => state.players[index]);
  const label = impostorNames.length > 1 ? 'Impostors' : 'Impostor';
  const message = `${label}: ${impostorNames.join(', ')}`;

  impostorReveal.textContent = message;
  impostorReveal.classList.remove('hidden');
}

function newRound() {
  if (!state.players.length) return;
  let selection;
  try {
    selection = randomCategoryAndWord();
  } catch (err) {
    setupError.textContent = err.message;
    return;
  }
  const { category, word } = selection;
  const impostorIndexes = pickImpostors(state.impostorCount, state.players.length);
  const startPlayerIndex = pickStartingPlayer(state.players.length);
  state = {
    ...state,
    category,
    word,
    impostorIndexes,
    startPlayerIndex,
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
    selectedLevels: [],
    selectedCategories: [],
    startPlayerIndex: null,
  };
  playerInput.value = '';
  impostorInput.value = 1;
  const languages = Object.keys(latestBank);
  const defaultLanguage = languages.includes('en') ? 'en' : languages[0] || 'en';
  languageSelect.value = defaultLanguage;
  state.language = defaultLanguage;
  state.selectedLevels = renderLevelCheckboxes(defaultLanguage, LEVEL_ORDER);
  state.selectedCategories = renderCategoryCheckboxes(defaultLanguage, state.selectedLevels);
  updateFilterSummaries();
  switchScreen('setup');
  renderReveal();
}

function populateSetup() {
  playerInput.value = state.players.join('\n');
  impostorInput.value = state.impostorCount;
  languageSelect.value = state.language;
  state.selectedLevels = renderLevelCheckboxes(state.language, state.selectedLevels);
  state.selectedCategories = renderCategoryCheckboxes(state.language, state.selectedLevels, state.selectedCategories);
  updateFilterSummaries();
  setupError.textContent = '';
}

async function refreshWordBank() {
  if (bankPromise) return bankPromise;
  wordSourceStatus.textContent = 'Loading latest words...';
  bankPromise = fetchWordBank()
    .then((bank) => {
      latestBank = bank;
      renderLanguageOptions(state.language);
      const language = languageSelect.value;
      state.language = language;
      state.selectedLevels = renderLevelCheckboxes(language, state.selectedLevels);
      state.selectedCategories = renderCategoryCheckboxes(language, state.selectedLevels, state.selectedCategories);
      updateFilterSummaries();
      wordSourceStatus.textContent = 'Loaded from shared sheet';
      if (shouldResumeReveal) {
        renderReveal();
        switchScreen('reveal');
        shouldResumeReveal = false;
      } else {
        renderReveal();
      }
      return bank;
    })
    .catch((err) => {
      setupError.textContent = err.message;
      wordSourceStatus.textContent = 'Unable to load words';
      throw err;
    })
    .finally(() => {
      bankPromise = null;
    });

  return bankPromise;
}

function ensureSelectionSync() {
  const language = languageSelect.value;
  state.language = language;
  state.selectedLevels = renderLevelCheckboxes(language, state.selectedLevels);
  state.selectedCategories = renderCategoryCheckboxes(language, state.selectedLevels, state.selectedCategories);
  updateFilterSummaries();
}

startGameBtn.addEventListener('click', () => startGame());
resetGameBtn.addEventListener('click', () => {
  playerInput.value = '';
  impostorInput.value = 1;
  setupError.textContent = '';
});

newRoundBtn.addEventListener('click', async () => {
  closeModal();
  try {
    await refreshWordBank();
    newRound();
  } catch (err) {
    setupError.textContent = err.message;
  }
});

editPlayersBtn.addEventListener('click', () => {
  closeModal();
  populateSetup();
  switchScreen('setup');
});

languageSelect.addEventListener('change', () => {
  ensureSelectionSync();
});

levelCheckboxes.addEventListener('change', (event) => {
  if (event.target instanceof HTMLInputElement && event.target.type === 'checkbox') {
    const selectedLevels = Array.from(levelCheckboxes.querySelectorAll('input[type="checkbox"]'))
      .filter((input) => input.checked)
      .map((input) => input.value);
    state.selectedLevels = selectedLevels;
    state.selectedCategories = renderCategoryCheckboxes(
      languageSelect.value,
      state.selectedLevels,
      state.selectedCategories
    );
    updateFilterSummaries();
  }
});

categoryCheckboxes.addEventListener('change', (event) => {
  if (event.target instanceof HTMLInputElement && event.target.type === 'checkbox') {
    const selectedCategories = Array.from(categoryCheckboxes.querySelectorAll('input[type="checkbox"]'))
      .filter((input) => input.checked)
      .map((input) => input.value);
    state.selectedCategories = selectedCategories;
    updateFilterSummaries();
  }
});

hardResetBtn.addEventListener('click', () => {
  closeModal();
  hardReset();
});

revealButton.addEventListener('click', showResult);
hideButton.addEventListener('click', () => {
  showRevealPrompt();
});

showImpostorsBtn.addEventListener('click', revealImpostorsToGroup);

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

loadState();
refreshWordBank();
