# KeySprout Typing Classroom

[Chinese](README.md) | [English](README.en.md)

[![CI](https://github.com/zhouzhih/typing-beginner/actions/workflows/ci.yml/badge.svg)](https://github.com/zhouzhih/typing-beginner/actions/workflows/ci.yml)
[![CodeQL](https://github.com/zhouzhih/typing-beginner/actions/workflows/codeql.yml/badge.svg)](https://github.com/zhouzhih/typing-beginner/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

KeySprout is a cartoon-style typing tutor for elementary-school beginners. It provides a web app and a macOS desktop app, with practice history stored locally by default.

<p>
  <img src="src-tauri/icons/128x128.png" alt="KeySprout app icon" width="96" height="96" />
</p>

## Features

- Progressive lessons: home-row keys, letter combinations, short words, short sentences, grammar sentences, and story typing.
- English learning while typing: grammar lessons include sentence patterns, and story lessons include Chinese meanings.
- Chinese pinyin practice: type pinyin for Chinese words and idioms.
- Real-time feedback: highlights the current character, correct characters, and typing mistakes.
- Practice records: saves accuracy, stars, streaks, level unlock progress, and supports CSV score export.
- Mistake bank: tracks frequently missed keys for focused review.
- Child-friendly interface: large buttons, a clear input area, cartoon typing partners, and switchable themes.
- Keyboard tips: simple cards for Shift, Backspace, Space, and other basic keys.
- Local-first data: custom avatars and practice history stay on the local device.
- macOS app: built with Tauri for offline local practice.

## Tech Stack

- React 19
- TypeScript
- Vite
- Vitest
- Tauri 2
- Rust

## Local Development

Recommended environment:

- Node.js 24, see `.nvmrc`
- npm 11+
- Rust stable with `cargo`
- Xcode Command Line Tools for macOS app builds
- The default macOS app build is universal and supports both Intel and Apple Silicon Macs.
- The Tauri CLI is installed as a local project dependency; no global Tauri install is required.

Install dependencies:

```bash
npm ci
```

Start the web development server:

```bash
npm run dev
```

Open the local URL printed in the terminal to start practicing.

## HTML Version for Windows

This project can run as a standalone web page without the desktop app, which works well on Windows.

```bash
npm run build
```

Open `dist/index.html` directly by double-click, or start a local static server:

```bash
cd dist
python -m http.server 4173
```

Then visit `http://127.0.0.1:4173/index.html`.

Run `make web-package` to create a distributable zip; it generates `KeySprout-web-<timestamp>.zip` by default.

## Common Commands

```bash
npm run lint       # lint source files
npm run typecheck  # run TypeScript type checks
npm test           # run unit tests
npm run build      # build the web app
make verify        # test, typecheck, and build the web app
```

## Build The macOS App

The first build downloads and compiles Rust dependencies, so it can take a while.

Check the local environment first:

```bash
make mac-check
```

If Rust or Cargo is missing:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
cargo --version
```

Universal builds also require both macOS Rust targets. `make mac-app` installs them automatically:

```bash
rustup target add aarch64-apple-darwin x86_64-apple-darwin
```

If a new terminal still cannot find `cargo`, add this line to `~/.zshrc`, then reopen the terminal:

```bash
source "$HOME/.cargo/env"
```

If Xcode Command Line Tools are missing:

```bash
xcode-select --install
```

If the local Tauri CLI is missing, install project dependencies:

```bash
npm ci
```

After the check passes, build the app:

```bash
make mac-app
```

Build output:

```text
src-tauri/target/release/bundle/macos/打字小课堂.app
```

Universal build output:

```text
src-tauri/target/universal-apple-darwin/release/bundle/macos/打字小课堂.app
```

The current build uses local ad-hoc signing. It is suitable for personal use and development testing. Before broader distribution, configure Apple Developer ID signing and notarization.

The default output is a Universal App that supports Intel Macs and Apple Silicon Macs.

Open the local app:

```bash
open "src-tauri/target/release/bundle/macos/打字小课堂.app"
```

For the default Universal build, open this path:

```bash
open "src-tauri/target/universal-apple-darwin/release/bundle/macos/打字小课堂.app"
```

Run the desktop app in development mode:

```bash
make mac-dev
```

Regenerate app icons:

```bash
make icons
```

Publish a stable release:

```bash
make release-tag VERSION=v0.1.0
```

Pushing a `v*` tag triggers GitHub Actions to build the macOS app and upload the zip file to GitHub Releases.
The Release now also includes:

- `KeySprout-<tag>-macos-universal.zip` (macOS app)
- `KeySprout-<tag>-web.zip` (HTML package; open `index.html` after unzipping)

## GitHub Actions

The repository includes these workflows:

- `CI`: runs lint, typecheck, tests, and web build on pushes and pull requests.
- `CodeQL`: scans JavaScript and TypeScript for security issues, including a weekly scheduled run.
- `macOS App Build`: builds the Universal macOS app on every `main` update, manual dispatch, or `v*` tag push; uploads an artifact; and creates a GitHub Release.

Release behavior:

- Push to `main`: creates a pre-release tag like `app-20260524-1200-123.1-abcdef0`, useful for downloading the latest app build.
- Push a `v*` tag: creates a stable release.

Dependabot checks npm, Cargo, and GitHub Actions dependencies every week.

## Privacy

KeySprout does not require an account and does not upload practice data by default. Practice history, theme choice, and custom avatars are stored in the local browser or local app data. When filing issues, do not upload children's names, school information, photos, or other private data.

## Project Structure

```text
src/
  app/          React app entry and integration tests
  components/   UI components
  data/         lesson and typing partner data
  domain/       pure logic for practice, progress, and statistics
  storage/      local record storage
  styles/       global styles and layout regression tests
src-tauri/      Tauri desktop app configuration and Rust entry
.github/        Actions, Dependabot, issue templates, and PR templates
```

## Open Source Collaboration

Issues and pull requests are welcome. Please read these documents first:

- [Contributing](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security Policy](SECURITY.md)
- [Support](SUPPORT.md)
- [Changelog](CHANGELOG.md)
- [GitHub Repository Settings](docs/github-settings.md)

## License

[MIT](LICENSE)
