MAC_APP_PATH := src-tauri/target/universal-apple-darwin/release/bundle/macos/打字小课堂.app
TIMESTAMP := $(shell date +%Y%m%d-%H%M%S)

.PHONY: test web icons mac-check mac-targets mac-dev mac-app release-tag verify

test:
	npm test

web:
	npm run build

web-package:
	test -d dist || (echo "Run 'make web' first or ensure the web build is available." && exit 1)
	cd dist && zip -r "../KeySprout-web-$(TIMESTAMP).zip" .
	@echo "Web package created: KeySprout-web-$(TIMESTAMP).zip"

icons:
	npm run icons

mac-check:
	@command -v node >/dev/null || (echo "Node.js is required. Install Node 24 first."; exit 1)
	@command -v npm >/dev/null || (echo "npm is required. Install Node.js/npm first."; exit 1)
	@command -v cargo >/dev/null || (echo "Cargo is required. Install Rust from https://rustup.rs, then restart the terminal or run: source $$HOME/.cargo/env"; exit 1)
	@command -v rustup >/dev/null || (echo "rustup is required for universal macOS builds. Install Rust from https://rustup.rs"; exit 1)
	@xcode-select -p >/dev/null || (echo "Xcode Command Line Tools are required. Run: xcode-select --install"; exit 1)
	@test -x node_modules/.bin/tauri || (echo "Local Tauri CLI is missing. Run: npm ci"; exit 1)

mac-targets: mac-check
	rustup target add aarch64-apple-darwin x86_64-apple-darwin

mac-dev: mac-check
	npm run mac:dev

mac-app: mac-check mac-targets
	npm run mac:build -- --target universal-apple-darwin
	codesign --force --deep --sign - "$(MAC_APP_PATH)"
	codesign --verify --deep --strict --verbose=2 "$(MAC_APP_PATH)"

release-tag:
	@test -n "$(VERSION)" || (echo "Usage: make release-tag VERSION=v0.1.0"; exit 1)
	git tag "$(VERSION)"
	git push origin "$(VERSION)"

verify:
	npm test
	npm run typecheck
	npm run build
