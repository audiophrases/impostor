# Impostor Game

A minimalist ESL classroom helper for running the "Impostor Game" on a shared device. Teachers enter player names and the number of impostors, then the app randomly assigns impostors, picks a category and a secret word, and guides private reveals for each student.

## How to run locally

- Download or clone this repository.
- Open `index.html` directly in your browser, **or** serve the folder with a simple local server:
  - Python 3: `python -m http.server 8000`
  - Node: `npx http-server .`
- Visit `http://localhost:8000` (or your chosen port).

## Enable GitHub Pages

1. Push this repository to GitHub.
2. In the repository settings, open **Pages**.
3. Choose the **Deploy from a branch** option.
4. Select the default branch (e.g., `main`) and the `/ (root)` folder, then save.
5. After deployment finishes, your site will be available at the provided GitHub Pages URL.

## Editing the word bank

- Open `data.js` and edit the `BANK` constant.
- Each property is a category name mapped to an array of words.
- Keep at least 10 categories with 10+ classroom-friendly words each so rounds stay fresh.
