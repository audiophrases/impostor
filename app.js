import { fetchWordBank } from './data.js';

const LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const STORAGE_KEY = 'impostor-game-state-v2';

const setupScreen = document.getElementById('setupScreen');
const revealScreen = document.getElementById('revealScreen');
const playerInput = document.getElementById('playerInput');
const impostorInput = document.getElementById('impostorInput');
const languageSelect = document.getElementById('languageSelect');
const uiLanguageSelect = document.getElementById('uiLanguageSelect');
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
const appTitle = document.getElementById('appTitle');
const setupTitle = document.getElementById('setupTitle');
const uiLanguageLabel = document.getElementById('uiLanguageLabel');
const uiLanguageHint = document.getElementById('uiLanguageHint');
const playerNamesLabel = document.getElementById('playerNamesLabel');
const wordBankLabel = document.getElementById('wordBankLabel');
const languageLabel = document.getElementById('languageLabel');
const levelsLabel = document.getElementById('levelsLabel');
const levelsHint = document.getElementById('levelsHint');
const categoriesLabel = document.getElementById('categoriesLabel');
const categoriesHint = document.getElementById('categoriesHint');
const impostorLabel = document.getElementById('impostorLabel');
const impostorHint = document.getElementById('impostorHint');
const revealCategoryLabel = document.getElementById('revealCategoryLabel');
const revealLanguageLabel = document.getElementById('revealLanguageLabel');
const revealLevelLabel = document.getElementById('revealLevelLabel');
const revealFiltersLabel = document.getElementById('revealFiltersLabel');
const startPlayerLabel = document.getElementById('startPlayerLabel');
const startPlayerHint = document.getElementById('startPlayerHint');

let state = {
  players: [],
  impostorCount: 1,
  impostorIndexes: [],
  category: '',
  word: '',
  revealed: [],
  language: 'en',
  uiLanguage: 'en',
  selectedLevels: [],
  selectedCategories: [],
  startPlayerIndex: null,
};

const UI_LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ca', label: 'Català' },
  { value: 'fr', label: 'Français' },
];

const translations = {
  en: {
    appTitle: 'Impostor Game',
    setupTitle: 'Setup',
    uiLanguageLabel: 'UI language',
    uiLanguageHint: 'Change the interface language',
    playerNamesLabel: 'Player names (one per line)',
    playerPlaceholder: 'Sam\nMina\nAlex',
    wordBankLabel: 'Word bank',
    languageLabel: 'Language',
    levelsLabel: 'Levels',
    levelsHint: 'Select one or more',
    categoriesLabel: 'Categories',
    categoriesHint: 'Select one or more',
    impostorLabel: 'Number of impostors',
    impostorHint: 'At least 1 and less than players',
    startGame: 'Start game',
    reset: 'Reset',
    revealCategoryLabel: 'Category',
    revealLanguageLabel: 'Language',
    revealLevelLabel: 'Level',
    revealFiltersLabel: 'Categories',
    startPlayerLabel: 'Starting player',
    startPlayerHint: 'This player begins the round and could be the impostor.',
    newRound: 'New round',
    editPlayers: 'Edit players',
    hardReset: 'Hard reset',
    showImpostors: 'Reveal impostor(s)',
    categoryNotStarted: 'Not started yet',
    noStartPlayer: 'No player selected yet',
    passDevice: 'Pass the device to:',
    reveal: 'Reveal',
    hide: 'Hide',
    impostorYes: 'You ARE the impostor.',
    impostorNo: 'You are NOT the impostor.',
    categoryLabel: 'Category',
    secretWordLabel: 'Secret word',
    waiting: 'Waiting',
    revealedStatus: '✓ Revealed',
    starterSuffix: ' • Starts',
    noneSelected: 'None selected',
    selectLevelsError: 'Choose at least one level.',
    selectCategoriesError: 'Choose at least one category.',
    playersError: 'Please enter at least 3 players.',
    impostorCountError: 'Impostors must be at least 1 and fewer than players.',
    noWordsError: 'No words available for that language, level, and category combination.',
    wordUnavailable: 'No words available for the selected filters.',
    confirmReveal:
      'Are you sure you want to see who the impostor(s) are? This will reveal them to everyone.',
    impostorLabelShort: 'Impostor',
    impostorsLabelShort: 'Impostors',
    loadingWords: 'Loading latest words...',
    loadedWords: 'Loaded from shared sheet',
    unableToLoadWords: 'Unable to load words',
  },
  ca: {
    appTitle: "Joc de l'Impostor",
    setupTitle: 'Configuració',
    uiLanguageLabel: 'Idioma de la interfície',
    uiLanguageHint: "Canvia l'idioma de la interfície",
    playerNamesLabel: 'Noms dels jugadors (un per línia)',
    playerPlaceholder: 'Sam\nMina\nAlex',
    wordBankLabel: 'Banc de paraules',
    languageLabel: 'Idioma',
    levelsLabel: 'Nivells',
    levelsHint: "Selecciona'n un o més",
    categoriesLabel: 'Categories',
    categoriesHint: "Selecciona'n una o més",
    impostorLabel: "Nombre d'impostors",
    impostorHint: 'Com a mínim 1 i menys que els jugadors',
    startGame: 'Comença la partida',
    reset: 'Reinicia',
    revealCategoryLabel: 'Categoria',
    revealLanguageLabel: 'Idioma',
    revealLevelLabel: 'Nivell',
    revealFiltersLabel: 'Categories',
    startPlayerLabel: 'Jugador inicial',
    startPlayerHint: "Aquest jugador comença la ronda i podria ser l'impostor.",
    newRound: 'Nova ronda',
    editPlayers: 'Edita els jugadors',
    hardReset: 'Reinici complet',
    showImpostors: "Mostra l'impostor(s)",
    categoryNotStarted: "Encara no s'ha començat",
    noStartPlayer: 'Cap jugador seleccionat encara',
    passDevice: 'Passa el dispositiu a:',
    reveal: 'Mostra',
    hide: 'Amaga',
    impostorYes: 'ETS l’impostor.',
    impostorNo: 'NO ets l’impostor.',
    categoryLabel: 'Categoria',
    secretWordLabel: 'Paraula secreta',
    waiting: 'Esperant',
    revealedStatus: '✓ Revelat',
    starterSuffix: ' • Comença',
    noneSelected: 'Cap seleccionat',
    selectLevelsError: 'Tria almenys un nivell.',
    selectCategoriesError: 'Tria almenys una categoria.',
    playersError: 'Introdueix almenys 3 jugadors.',
    impostorCountError: 'Els impostors han de ser com a mínim 1 i menys que els jugadors.',
    noWordsError: 'No hi ha paraules per a aquesta combinació d’idioma, nivell i categoria.',
    wordUnavailable: 'No hi ha paraules per als filtres seleccionats.',
    confirmReveal:
      'Segur que vols veure qui és/ són l’impostor(s)? Això els revelarà a tothom.',
    impostorLabelShort: 'Impostor',
    impostorsLabelShort: 'Impostors',
    loadingWords: 'Carregant les paraules més recents...',
    loadedWords: 'Carregades des del full compartit',
    unableToLoadWords: 'No s’han pogut carregar les paraules',
  },
  fr: {
    appTitle: "Jeu de l'Imposteur",
    setupTitle: 'Configuration',
    uiLanguageLabel: 'Langue de l’interface',
    uiLanguageHint: 'Changer la langue de l’interface',
    playerNamesLabel: 'Noms des joueurs (un par ligne)',
    playerPlaceholder: 'Sam\nMina\nAlex',
    wordBankLabel: 'Banque de mots',
    languageLabel: 'Langue',
    levelsLabel: 'Niveaux',
    levelsHint: 'Sélectionnez-en un ou plusieurs',
    categoriesLabel: 'Catégories',
    categoriesHint: 'Sélectionnez-en une ou plusieurs',
    impostorLabel: "Nombre d'imposteurs",
    impostorHint: 'Au moins 1 et moins que les joueurs',
    startGame: 'Démarrer la partie',
    reset: 'Réinitialiser',
    revealCategoryLabel: 'Catégorie',
    revealLanguageLabel: 'Langue',
    revealLevelLabel: 'Niveau',
    revealFiltersLabel: 'Catégories',
    startPlayerLabel: 'Joueur de départ',
    startPlayerHint: 'Ce joueur commence la manche et peut être l’imposteur.',
    newRound: 'Nouvelle manche',
    editPlayers: 'Modifier les joueurs',
    hardReset: 'Réinitialisation totale',
    showImpostors: "Révéler l'imposteur/les imposteurs",
    categoryNotStarted: 'Pas encore commencé',
    noStartPlayer: 'Aucun joueur sélectionné',
    passDevice: 'Passez l’appareil à :',
    reveal: 'Révéler',
    hide: 'Masquer',
    impostorYes: 'Vous ÊTES l’imposteur.',
    impostorNo: "Vous n'êtes PAS l’imposteur.",
    categoryLabel: 'Catégorie',
    secretWordLabel: 'Mot secret',
    waiting: 'En attente',
    revealedStatus: '✓ Révélé',
    starterSuffix: ' • Commence',
    noneSelected: 'Aucune sélection',
    selectLevelsError: 'Choisissez au moins un niveau.',
    selectCategoriesError: 'Choisissez au moins une catégorie.',
    playersError: 'Saisissez au moins 3 joueurs.',
    impostorCountError: "Les imposteurs doivent être au moins 1 et moins que les joueurs.",
    noWordsError:
      "Aucun mot disponible pour cette combinaison de langue, niveau et catégorie.",
    wordUnavailable: 'Aucun mot disponible pour les filtres sélectionnés.',
    confirmReveal:
      "Êtes-vous sûr de vouloir afficher l’imposteur/les imposteurs ? Cela le révélera à tous.",
    impostorLabelShort: 'Imposteur',
    impostorsLabelShort: 'Imposteurs',
    loadingWords: 'Chargement des derniers mots...',
    loadedWords: 'Chargés depuis la feuille partagée',
    unableToLoadWords: 'Impossible de charger les mots',
  },
};

let latestBank = {};
let bankPromise = null;
let currentPlayerIndex = null;
let hideTimer = null;
let shouldResumeReveal = false;
let currentWordStatusKey = null;

function t(key) {
  const lang = translations[state.uiLanguage] ? state.uiLanguage : 'en';
  return translations[lang][key] ?? translations.en[key] ?? key;
}

function renderUILanguageOptions(selectedLanguage) {
  uiLanguageSelect.innerHTML = '';
  UI_LANGUAGES.forEach(({ value, label }) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    uiLanguageSelect.appendChild(option);
  });
  const desired = UI_LANGUAGES.some((lang) => lang.value === selectedLanguage) ? selectedLanguage : 'en';
  uiLanguageSelect.value = desired;
}

function applyTranslations() {
  document.documentElement.lang = state.uiLanguage;
  document.title = t('appTitle');
  appTitle.textContent = t('appTitle');
  setupTitle.textContent = t('setupTitle');
  uiLanguageLabel.textContent = t('uiLanguageLabel');
  uiLanguageHint.textContent = t('uiLanguageHint');
  playerNamesLabel.textContent = t('playerNamesLabel');
  playerInput.placeholder = t('playerPlaceholder');
  wordBankLabel.textContent = t('wordBankLabel');
  languageLabel.textContent = t('languageLabel');
  levelsLabel.textContent = t('levelsLabel');
  levelsHint.textContent = t('levelsHint');
  categoriesLabel.textContent = t('categoriesLabel');
  categoriesHint.textContent = t('categoriesHint');
  impostorLabel.textContent = t('impostorLabel');
  impostorHint.textContent = t('impostorHint');
  startGameBtn.textContent = t('startGame');
  resetGameBtn.textContent = t('reset');
  revealCategoryLabel.textContent = t('revealCategoryLabel');
  revealLanguageLabel.textContent = t('revealLanguageLabel');
  revealLevelLabel.textContent = t('revealLevelLabel');
  revealFiltersLabel.textContent = t('revealFiltersLabel');
  startPlayerLabel.textContent = t('startPlayerLabel');
  startPlayerHint.textContent = t('startPlayerHint');
  newRoundBtn.textContent = t('newRound');
  editPlayersBtn.textContent = t('editPlayers');
  hardResetBtn.textContent = t('hardReset');
  showImpostorsBtn.textContent = t('showImpostors');
  revealButton.textContent = t('reveal');
  hideButton.textContent = t('hide');
  if (currentWordStatusKey) {
    wordSourceStatus.textContent = t(currentWordStatusKey);
  }
}

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
  if (!values.length) return t('noneSelected');
  return values.join(', ');
}

function updateFilterSummaries() {
  levelDisplay.textContent = describeSelection(state.selectedLevels);
  categoryFiltersDisplay.textContent = describeSelection(state.selectedCategories);
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function setWordStatus(key) {
  currentWordStatusKey = key;
  wordSourceStatus.textContent = key ? t(key) : '';
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
        uiLanguage: parsed.uiLanguage || state.uiLanguage,
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
    throw new Error(t('wordUnavailable'));
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
    setupError.textContent = t('playersError');
    return;
  }

  if (!Number.isInteger(impostorCount) || impostorCount < 1 || impostorCount >= players.length) {
    setupError.textContent = t('impostorCountError');
    return;
  }

  if (!selectedLevels.length) {
    setupError.textContent = t('selectLevelsError');
    return;
  }

  if (!selectedCategories.length) {
    setupError.textContent = t('selectCategoriesError');
    return;
  }

  state.language = language;
  state.selectedLevels = selectedLevels;
  state.selectedCategories = selectedCategories;

  const pool = buildWordPool();
  if (!pool.length) {
    setupError.textContent = t('noWordsError');
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
  categoryDisplay.textContent = state.category || t('categoryNotStarted');
  languageDisplay.textContent = state.language.toUpperCase();
  levelDisplay.textContent = describeSelection(state.selectedLevels);
  categoryFiltersDisplay.textContent = describeSelection(state.selectedCategories);
  const startingPlayer =
    typeof state.startPlayerIndex === 'number' && state.players[state.startPlayerIndex]
      ? state.players[state.startPlayerIndex]
      : t('noStartPlayer');
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
    const starterLabel = isStarter ? t('starterSuffix') : '';
    status.textContent = state.revealed[index]
      ? `${t('revealedStatus')}${starterLabel}`
      : `${t('waiting')}${starterLabel}`;

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
  modalPrompt.textContent = t('passDevice');
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
  role.textContent = isImpostor ? t('impostorYes') : t('impostorNo');
  role.style.fontWeight = '700';
  body.appendChild(role);

  const category = document.createElement('p');
  category.textContent = `${t('categoryLabel')}: ${state.category}`;
  body.appendChild(category);

  if (!isImpostor) {
    const word = document.createElement('p');
    word.textContent = `${t('secretWordLabel')}: ${state.word}`;
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
    t('confirmReveal')
  );

  if (!confirmed) return;

  const impostorNames = state.impostorIndexes.map((index) => state.players[index]);
  const label = impostorNames.length > 1 ? t('impostorsLabelShort') : t('impostorLabelShort');
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
  setWordStatus(null);
  state = {
    players: [],
    impostorCount: 1,
    impostorIndexes: [],
    category: '',
    word: '',
    revealed: [],
    language: 'en',
    uiLanguage: 'en',
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
  renderUILanguageOptions(state.uiLanguage);
  uiLanguageSelect.value = state.uiLanguage;
  state.selectedLevels = renderLevelCheckboxes(defaultLanguage, LEVEL_ORDER);
  state.selectedCategories = renderCategoryCheckboxes(defaultLanguage, state.selectedLevels);
  updateFilterSummaries();
  applyTranslations();
  switchScreen('setup');
  renderReveal();
}

function populateSetup() {
  playerInput.value = state.players.join('\n');
  impostorInput.value = state.impostorCount;
  languageSelect.value = state.language;
  uiLanguageSelect.value = state.uiLanguage;
  state.selectedLevels = renderLevelCheckboxes(state.language, state.selectedLevels);
  state.selectedCategories = renderCategoryCheckboxes(state.language, state.selectedLevels, state.selectedCategories);
  updateFilterSummaries();
  setupError.textContent = '';
}

async function refreshWordBank() {
  if (bankPromise) return bankPromise;
  setWordStatus('loadingWords');
  bankPromise = fetchWordBank()
    .then((bank) => {
      latestBank = bank;
      renderLanguageOptions(state.language);
      const language = languageSelect.value;
      state.language = language;
      state.selectedLevels = renderLevelCheckboxes(language, state.selectedLevels);
      state.selectedCategories = renderCategoryCheckboxes(language, state.selectedLevels, state.selectedCategories);
      updateFilterSummaries();
      setWordStatus('loadedWords');
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
      setWordStatus('unableToLoadWords');
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

uiLanguageSelect.addEventListener('change', () => {
  state.uiLanguage = uiLanguageSelect.value;
  applyTranslations();
  renderReveal();
  saveState();
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
renderUILanguageOptions(state.uiLanguage);
applyTranslations();
refreshWordBank();
