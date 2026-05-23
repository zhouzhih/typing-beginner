import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, test } from 'vitest'

describe('app icon configuration', () => {
  test('uses the custom typing classroom icon assets for app bundles', () => {
    const config = JSON.parse(readFileSync('src-tauri/tauri.conf.json', 'utf-8')) as {
      bundle?: { icon?: string[] }
    }
    const icons = config.bundle?.icon ?? []

    expect(existsSync('src-tauri/app-icon.svg')).toBe(true)
    expect(icons).toEqual(
      expect.arrayContaining(['icons/icon.icns', 'icons/icon.ico', 'icons/icon.png']),
    )

    for (const icon of icons) {
      expect(existsSync(resolve('src-tauri', icon))).toBe(true)
    }
  })
})
