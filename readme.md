# LLM to Notion

**LLM to Notion** is a Chrome extension that makes it easy to copy AI-generated answers with math into Notion (and other editors) without breaking formulas.

It:

- Detects LaTeX and rendered KaTeX equations in ChatGPT and other LLM UIs.
- Normalizes them into a consistent `$<…>$` format that survives copy/paste.
- Provides a floating **“Copy for Notion”** button for math-heavy selections.
- Helps you step through equations inside Notion to quickly turn them into native Notion math blocks.

---

## 📚 Table of Contents

1. [About the Project](#-about-the-project)  
   - [Key Features](#-key-features)  
   - [How It Works at a High Level](#-how-it-works-at-a-high-level)
2. [Getting Started](#-getting-started)  
   - [Prerequisites](#-prerequisites)  
   - [Install from Chrome Web Store](#-install-from-chrome-web-store)  
   - [Run Locally in Development](#-run-locally-in-development)
3. [Usage](#-usage)  
   - [Copying from ChatGPT / Other LLMs](#copying-from-chatgpt--other-llms)  
   - [Working with Equations inside Notion](#working-with-equations-inside-notion)
4. [Project Structure & Architecture](#-project-structure--architecture)  
   - [Code Overview](#code-overview)  
   - [Math Extraction & Normalization](#math-extraction--normalization)  
   - [Notion Integration](#notion-integration)
5. [Development](#-development)  
   - [Install Dependencies](#install-dependencies)  
   - [Build Scripts](#build-scripts)  
   - [Running Tests](#running-tests)
6. [CI/CD & Publishing](#-cicd--publishing)  
   - [Branch Workflows](#branch-workflows)  
   - [Automatic Chrome Web Store Publishing](#automatic-chrome-web-store-publishing)
7. [Contributing](#-contributing)  
   - [How to Propose Changes](#how-to-propose-changes)  
   - [Code Style & Expectations](#code-style--expectations)
8. [License](#-license)

---

## 🔍 About the Project

LLMs are great at explaining math, but the output is often a mix of:

- LaTeX snippets (`$x^2 + y^2 = 1$`, `\int_0^1 f(x)dx`)
- Rendered KaTeX equations
- Inline Unicode math symbols

Copying that into Notion (or other tools) usually breaks formatting, loses the LaTeX, or turns equations into unreadable markup.

**LLM to Notion** solves this by:

- Detecting equations in the browser DOM.
- Converting them into a consistent `$<…>$` wrapper format.
- Letting Notion remain the renderer, while you keep the raw LaTeX.

### ✨ Key Features

- ✅ **Smart math detection**
  - Understands KaTeX-rendered formulas in ChatGPT.
  - Handles multiple providers (ChatGPT, Grok, Gemini, Claude, generic LLMs).
  - Supports `$$…$$`, `$…$`, `\(...\)`, `\[...\]`, and heuristic detection of Unicode/ASCII math blocks.

- ✅ **One-click “Copy for Notion”**
  - Floating button appears when your selection looks like math.
  - Copies a cleaned-up version to the clipboard and into `chrome.storage` under `notionCopyText`.

- ✅ **Notion equation workflow**
  - After you paste into Notion, the extension helps you:
    - Find `$<…>$` segments.
    - Step through equations with function keys.
    - Strip the `$<` / `>$` delimiters while keeping the LaTeX inner content.

- ✅ **Provider-aware behavior**
  - Different extraction strategies for:
    - `chatgpt`
    - `gemini`
    - `claude`
    - `generic` LLMs

- ✅ **Fully tested core logic**
  - Jest + jsdom tests for:
    - Math extraction and normalization
    - Equation delimiter detection
    - Notion formatting
    - Provider/host configuration
    - Basic equation assistant behavior

### 🧠 How It Works at a High Level

At a high level, the content script:

1. Detects which host you’re on (ChatGPT, Gemini, Claude, etc.).
2. Chooses a math extraction strategy based on the provider.
3. Listens to text selection changes in the page.
4. When a math-like selection is detected, shows a floating button.
5. On click, normalizes the math to `$<…>$`, saves it to `chrome.storage`, and copies it to the clipboard.
6. On Notion pages, it helps you find and convert those `$<…>$` segments into real Notion math blocks.

---

## ⚙️ Getting Started

### ✅ Prerequisites

- **Node.js**: v18+ recommended  
- **npm**: v9+ recommended  
- **Google Chrome** (or a Chromium-based browser that supports Manifest V3)

Check your versions:

```bash
node -v
npm -v
```

---

### 🛒 Install from Chrome Web Store

The extension is available here:

- `https://chrome.google.com/webstore/detail/chatgpt-equation-renderer/nkkkaendbndanjjndfpebmekhgdjlhkh?hl`

1. Open the link in Chrome.
2. Click **“Add to Chrome”**.
3. Pin the extension in your toolbar for quick access (optional but recommended).

---

### 💻 Run Locally in Development

Clone the project:

```bash
git clone https://github.com/<your-username>/chatgpt-equations.git
cd chatgpt-equations
```

Install dependencies:

```bash
npm install
```

Build the extension (development build):

```bash
npm run build-dev
```

This will output the built extension into the `extension/` folder.

Load it in Chrome:

1. Open `chrome://extensions/` in Chrome.
2. Enable **Developer mode** (toggle in the top right).
3. Click **“Load unpacked”**.
4. Select the `extension/` directory in this repo.

Chrome will now load your local build. When you edit the source and re-run `npm run build-dev`, you can hit **Reload** in `chrome://extensions/` to pick up changes.

---

## 🧩 Usage

### Copying from ChatGPT / Other LLMs

1. Open a conversation in ChatGPT, Grok, Gemini, Claude, or another supported host.
2. Select a snippet that contains math (inline or block).
3. When the extension detects math, a floating **“Copy for Notion”** button appears near your selection.
4. Click the button:
   - The selection is normalized into the `$<…>$` format.
   - The result is copied to your clipboard.
   - The same text is stored in `chrome.storage.local` as `notionCopyText` (for advanced workflows).

You can now paste directly into Notion or any other editor.

### Working with Equations inside Notion

On Notion pages:

- After pasting text that contains `$<…>$` segments:
  - The extension scans the active editable area and collects all `$<…>$` occurrences.
  - It helps you:
    - Highlight the inner LaTeX content.
    - Remove the `$<` / `>$` wrappers in the plain text.
    - Step through equations sequentially until all have been converted.

The exact key bindings and stepping behavior live in the content script logic for Notion (see the `src/index.js` and `src/content/notionContent.ts` code in this repo).

---

## 🧱 Project Structure & Architecture

### Code Overview

At a high level:

- `webpack.config.js` – bundles the extension:
  - Entry points:
    - `src/bootstrap.ts` → `extension/content.js`
    - `src/popup/index.tsx` → `extension/popup.js`
- `extension/` – compiled output + manifest + assets.
- `src/bootstrap.ts` – entry point for content scripts:
  - Detects host.
  - Loads the right equation assistant for LLM pages.
  - Initializes Notion-specific behavior on Notion hosts.
- `src/content/equationAssistant.ts` – logic that:
  - Tracks selection changes.
  - Calls the core math extraction utilities.
  - Renders and handles the floating “Copy for Notion” button.
- `src/core/` – core logic, fully unit-tested:
  - `mathExtraction.ts` – provider-aware math extraction and normalization.
  - `equations.ts` – delimiter definitions and collection of `$<…>$` ranges.
  - `notionFormat.ts` – walks KaTeX DOM and produces Notion-friendly text.
  - `selection.ts` – selection helpers (e.g. detecting `.katex`).
  - `providers.ts` – maps hosts to providers (`chatgpt`, `gemini`, `claude`, `generic`).
  - `clipboard.ts`, `i18n.ts` – clipboard handling and localization support.

### Math Extraction & Normalization

Key pieces live in `src/core/mathExtraction.ts`:

- `extractMathFromGeminiSelection` – block-only normalization for Gemini.
- `extractMathFromChatGpt` – uses `getNotionFormatFromSelection` (DOM-based).
- `extractMathFromSelectionGeneric` – generic path:
  - Normalizes LaTeX delimiters.
  - Falls back to Unicode / ASCII heuristics for math-like blocks.
  - Produces a single `$<…>$` expression when math is confidently detected.
- `normalizeGeminiClipboardText` – used for reading Gemini’s raw clipboard text.

Delimiter handling in `src/core/equations.ts` defines:

- `EQUATION_OPEN_DELIM = "$<"`
- `EQUATION_CLOSE_DELIM = ">$"`
- `collectEquationRanges(root)` returns `EquationTarget[]` with:
  - `inner` – LaTeX-only range.
  - `left` – `$<` range.
  - `right` – `>$` range.

---

## 🧪 Development

### Install Dependencies

From the repo root:

```bash
npm install
```

This installs:

- Webpack + loaders for TypeScript/React.
- Jest + ts-jest + jsdom for testing.
- Type definitions for Chrome and React.

### Build Scripts

Defined in `package.json`:

- **Development build**

  ```bash
  npm run build-dev
  ```

- **Production build**

  ```bash
  npm run build-prod
  ```

- **Watch mode (rebuild on changes)**

  ```bash
  npm run watch
  ```

### Running Tests

We use **Jest** with the **jsdom** environment.

- Run the full test suite once:

  ```bash
  npm test
  ```

- Run in watch mode during development:

  ```bash
  npm run test:watch
  ```

What is covered:

- `src/core/notionFormat.ts` – entity decoding, structure formatting, KaTeX handling.
- `src/core/equations.ts` – delimiter detection, nested/stacked pairs, safe deletion.
- `src/core/mathExtraction.ts` – provider-specific and generic extraction paths.
- `src/core/selection.ts` – `.katex` detection for selections.
- `src/core/providers.ts` – host → provider mapping and defaults.
- `src/content/equationAssistant.ts` – basic integration behavior:
  - Button visibility on math-like selections.
  - Writing to `chrome.storage.local` and clipboard on click.

---

## 🚀 CI/CD & Publishing

### Branch Workflows

We use GitHub Actions, defined in `.github/workflows/ci.yml`:

- **For all branches (`push` + `pull_request`)**:
  - `build-and-test` job:
    - `npm ci`
    - `npm run build-prod`
    - `npm test`
    - Uploads the built `extension/` as an artifact.

This ensures that every branch and PR is built and tested before merging.

### Automatic Chrome Web Store Publishing

On **pushes to `main`**, after `build-and-test` succeeds:

- `publish-chrome` job:
  - Re-checkout and install dependencies.
  - Build the extension (`npm run build-prod`).
  - Run the version bump script:

    ```bash
    node scripts/bump-version.mjs
    ```

    This:
    - Reads `extension/manifest.json` and `package.json`.
    - Increments the patch version (e.g. `0.1.0` → `0.1.1`).
    - Writes the new version back into both files.

  - Zips the `extension` folder into `extension.zip`.
  - Calls `chrome-webstore-upload-cli` to upload & auto-publish the new version.

Required GitHub Action secrets (configured in repo settings):

- `CHROME_EXTENSION_ID` – your extension ID.
- `CHROME_CLIENT_ID` – OAuth client ID.
- `CHROME_CLIENT_SECRET` – OAuth client secret.
- `CHROME_REFRESH_TOKEN` – refresh token with publish rights.

Contributors generally don’t need to worry about this; maintainers handle the secrets and release process.

---

## 🤝 Contributing

We welcome contributions of all kinds: bug fixes, new features, documentation improvements, and better math-handling heuristics.

### How to Propose Changes

1. **Fork** the repository.
2. **Create a feature branch**:

   ```bash
   git checkout -b feature/my-improvement
   ```

3. Make your changes:
   - Keep core math/selection logic inside `src/core/` when possible.
   - Keep browser/UI behavior in `src/content/` or the popup React code.
4. **Run tests locally**:

   ```bash
   npm test
   ```

   If you add new behavior to the core, add or update tests under `src/core/__tests__/`.

5. **Build** to ensure it still compiles:

   ```bash
   npm run build-prod
   ```

6. **Open a Pull Request**:
   - Describe the problem you’re solving.
   - Explain your approach and any trade-offs.
   - Mention any user-facing changes (UI, shortcuts, behavior).

### Code Style & Expectations

- TypeScript for core logic.
- Prefer pure functions and small, testable units in `src/core/`.
- Document non-obvious behavior in code comments where needed.
- Keep DOM and browser APIs in content scripts; avoid leaking them into core utilities.
- Make sure tests pass and the extension builds before requesting review.

If you’re unsure where something should live, open an issue or a draft PR and we can discuss it.

---

## 📄 License

The LLM to Notion Chrome Extension is licensed under the **MIT License**. See the `LICENSE` file for details.
