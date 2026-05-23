import { describe, expect, test } from 'vitest'

import { mascots } from './mascots'

describe('mascots', () => {
  test('uses a different image asset for each built-in typing buddy', () => {
    const imageSources = mascots.map((mascot) => mascot.imageSrc)

    expect(new Set(imageSources).size).toBe(mascots.length)
    expect(imageSources.every((imageSrc) => imageSrc.includes('.svg') || imageSrc.includes('image/svg+xml'))).toBe(true)
  })
})
