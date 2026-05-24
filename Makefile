.PHONY: test web icons mac-check mac-dev mac-app release-tag verify

test:
	npm test

web:
	npm run build

icons:
	npm run icons

mac-check:
	@command -v node >/dev/null || (echo "Node.js is required. Install Node 24 first."; exit 1)
	@command -v npm >/dev/null || (echo "npm is required. Install Node.js/npm first."; exit 1)
	@command -v cargo >/dev/null || (echo "Cargo is required. Install Rust from https://rustup.rs, then restart the terminal or run: source $$HOME/.cargo/env"; exit 1)
	@xcode-select -p >/dev/null || (echo "Xcode Command Line Tools are required. Run: xcode-select --install"; exit 1)
	@test -x node_modules/.bin/tauri || (echo "Local Tauri CLI is missing. Run: npm ci"; exit 1)

mac-dev: mac-check
	npm run mac:dev

mac-app: mac-check
	npm run mac:build
	codesign --force --deep --sign - "src-tauri/target/release/bundle/macos/打字小课堂.app"
	codesign --verify --deep --strict --verbose=2 "src-tauri/target/release/bundle/macos/打字小课堂.app"

release-tag:
	@test -n "$(VERSION)" || (echo "Usage: make release-tag VERSION=v0.1.0"; exit 1)
	git tag "$(VERSION)"
	git push origin "$(VERSION)"

verify:
	npm test
	npm run typecheck
	npm run build
