import { readFileSync } from 'node:fs'

import { describe, expect, test } from 'vitest'

describe('desktop build config', () => {
  test('provides one-command mac app build scripts', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf-8')) as {
      scripts: Record<string, string>
    }
    const makefile = readFileSync('Makefile', 'utf-8')

    expect(packageJson.scripts.tauri).toBe('tauri')
    expect(packageJson.scripts['mac:build']).toBe('tauri build')
    expect(makefile).toContain('mac-app:')
    expect(makefile).toContain('npm run mac:build')
    expect(makefile).toContain('codesign --force --deep --sign -')
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
