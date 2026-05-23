.PHONY: test web mac-dev mac-app verify

test:
	npm test

web:
	npm run build

mac-dev:
	npm run mac:dev

mac-app:
	npm run mac:build
	codesign --force --deep --sign - "src-tauri/target/release/bundle/macos/打字小课堂.app"
	codesign --verify --deep --strict --verbose=2 "src-tauri/target/release/bundle/macos/打字小课堂.app"

verify:
	npm test
	npm run typecheck
	npm run build
