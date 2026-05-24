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

The current build uses local ad-hoc signing. It is suitable for personal use and development testing. Before broader distribution, configure Apple Developer ID signing and notarization.

Open the local app:

```bash
open "src-tauri/target/release/bundle/macos/打字小课堂.app"
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

## GitHub Actions

The repository includes these workflows:

- `CI`: runs lint, typecheck, tests, and web build on pushes and pull requests.
- `CodeQL`: scans JavaScript and TypeScript for security issues, including a weekly scheduled run.
- `macOS App Build`: builds the macOS app on every `main` update, manual dispatch, or `v*` tag push; uploads an artifact; and creates a GitHub Release.

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
