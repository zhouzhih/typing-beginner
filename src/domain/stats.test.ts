import { describe, expect, test } from 'vitest'

import { calculateAccuracy, calculateDurationMs, calculateStars, isPassed } from './stats'

describe('stats helpers', () => {
  test('calculates accuracy from total characters and mistakes', () => {
    expect(calculateAccuracy(10, 1)).toBe(90)
    expect(calculateAccuracy(3, 1)).toBe(67)
  })

  test('treats empty practice as fully accurate', () => {
    expect(calculateAccuracy(0, 0)).toBe(100)
  })

  test('calculates stars from accuracy thresholds', () => {
    expect(calculateStars(96)).toBe(3)
    expect(calculateStars(88)).toBe(2)
    expect(calculateStars(70)).toBe(1)
  })

  test('passes only completed practice at or above threshold', () => {
    expect(isPassed(85, true)).toBe(true)
    expect(isPassed(84, true)).toBe(false)
    expect(isPassed(100, false)).toBe(false)
  })

  test('calculates elapsed duration in milliseconds', () => {
    const startedAt = '2026-05-23T08:00:00.000Z'
    const completedAt = '2026-05-23T08:00:05.500Z'

    expect(calculateDurationMs(startedAt, completedAt)).toBe(5500)
  })
})
