import { describe, expect, test } from 'vitest'

import {
  getMascotLevel,
  getMascotLevelFromXp,
  getPurchasableRewards,
  getUnlockedRewards,
} from './mascot'
import type { PracticeRecord } from './types'

function record(overrides: Partial<PracticeRecord>): PracticeRecord {
  return {
    id: overrides.id ?? 'record',
    lessonId: overrides.lessonId ?? 'home-row',
    prompt: overrides.prompt ?? 'asdf',
    startedAt: overrides.startedAt ?? '2026-05-23T01:00:00.000Z',
    completedAt: overrides.completedAt ?? '2026-05-23T01:01:00.000Z',
    durationMs: overrides.durationMs ?? 60_000,
    totalChars: overrides.totalChars ?? 4,
    mistakes: overrides.mistakes ?? 0,
    accuracy: overrides.accuracy ?? 100,
    stars: overrides.stars ?? 3,
    passed: overrides.passed ?? true,
  }
}

describe('mascot progression', () => {
  test('starts at level one without passed practice', () => {
    expect(getMascotLevel([])).toBe(1)
  })

  test('levels up as the learner clears more practice', () => {
    expect(getMascotLevel([record({ id: 'one' }), record({ id: 'two' })])).toBe(2)
    expect(
      getMascotLevel([
        record({ id: 'one' }),
        record({ id: 'two' }),
        record({ id: 'three' }),
        record({ id: 'four' }),
      ]),
    ).toBe(3)
    expect(
      getMascotLevel([
        record({ id: 'one' }),
        record({ id: 'two' }),
        record({ id: 'three' }),
        record({ id: 'four' }),
        record({ id: 'five' }),
        record({ id: 'six' }),
      ]),
    ).toBe(4)
  })

  test('unlocks rewards from practice passes and stars', () => {
    const records = [
      record({ id: 'one', stars: 2 }),
      record({ id: 'two', stars: 3 }),
      record({ id: 'three', stars: 3 }),
      record({ id: 'four', stars: 3 }),
    ]

    expect(getUnlockedRewards(records).map((reward) => reward.id)).toEqual([
      'star-sticker',
      'keycap-crown',
      'hero-cape',
      'gold-medal',
    ])
  })

  test('levels the mascot from experience points', () => {
    expect(getMascotLevelFromXp(0)).toBe(1)
    expect(getMascotLevelFromXp(60)).toBe(2)
    expect(getMascotLevelFromXp(140)).toBe(3)
    expect(getMascotLevelFromXp(260)).toBe(4)
    expect(getMascotLevelFromXp(420)).toBe(5)
  })

  test('filters shop rewards by mascot level', () => {
    expect(getPurchasableRewards(1).map((reward) => reward.id)).toEqual(['star-sticker'])
    expect(getPurchasableRewards(3).map((reward) => reward.id)).toEqual([
      'star-sticker',
      'keycap-crown',
      'hero-cape',
    ])
  })
})
