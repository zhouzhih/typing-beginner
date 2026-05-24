import { readFileSync } from 'node:fs'

import { describe, expect, test } from 'vitest'

describe('desktop build config', () => {
  test('provides one-command mac app build scripts', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf-8')) as {
      scripts: Record<string, string>
    }
    const makefile = readFileSync('Makefile', 'utf-8')
    const universalBundlePath =
      'src-tauri/target/universal-apple-darwin/release/bundle/macos/打字小课堂.app'

    expect(packageJson.scripts.tauri).toBe('tauri')
    expect(packageJson.scripts['mac:build']).toBe('tauri build')
    expect(makefile).toContain('mac-app:')
    expect(makefile).toContain('npm run mac:build -- --target universal-apple-darwin')
    expect(makefile).toContain(universalBundlePath)
    expect(makefile).toContain('codesign --force --deep --sign -')
  })

  test('builds release apps as universal macOS binaries for Intel and Apple Silicon', () => {
    const makefile = readFileSync('Makefile', 'utf-8')
    const macosBuildWorkflow = readFileSync('.github/workflows/macos-build.yml', 'utf-8')
    const universalBundlePath =
      'src-tauri/target/universal-apple-darwin/release/bundle/macos/打字小课堂.app'

    expect(makefile).toContain('rustup target add aarch64-apple-darwin x86_64-apple-darwin')
    expect(macosBuildWorkflow).toContain(
      'rustup target add aarch64-apple-darwin x86_64-apple-darwin',
    )
    expect(macosBuildWorkflow).toContain('Universal macOS app build')
    expect(macosBuildWorkflow).toContain(universalBundlePath)
  })

  test('points Tauri at the Vite build output for mac packaging', () => {
    const tauriConfig = JSON.parse(readFileSync('src-tauri/tauri.conf.json', 'utf-8')) as {
      build: Record<string, string>
      bundle: { targets: string[] }
    }

    expect(tauriConfig.build.frontendDist).toBe('../dist')
    expect(tauriConfig.build.beforeBuildCommand).toBe('npm run build')
    expect(tauriConfig.bundle.targets).toEqual(['app'])
  })
})
