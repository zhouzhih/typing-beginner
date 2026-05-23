import { describe, expect, test } from 'vitest'

import { getThemeById, themes } from './theme'

describe('theme', () => {
  test('provides kid-friendly page themes with stable ids', () => {
    expect(themes.map((theme) => theme.id)).toEqual(['meadow', 'sky', 'space'])
    expect(themes.every((theme) => theme.title.length > 0)).toBe(true)
  })

  test('falls back to the default theme when a saved id is unknown', () => {
    expect(getThemeById('missing')).toEqual(themes[0])
  })
})
