import { describe, expect, test } from 'vitest'

import {
  buildDailyTasks,
  calculatePracticeReward,
  getTodayCoinsEarned,
} from './gamification'
import type { PracticeRecord } from './types'

function record(overrides: Partial<PracticeRecord>): PracticeRecord {
  return {
    id: overrides.id ?? 'record',
    lessonId: overrides.lessonId ?? 'home-row',
    prompt: overrides.prompt ?? 'asdf',
    startedAt: overrides.startedAt ?? '2026-05-24T01:00:00.000Z',
    completedAt: overrides.completedAt ?? '2026-05-24T01:01:00.000Z',
    durationMs: overrides.durationMs ?? 60_000,
    totalChars: overrides.totalChars ?? 4,
    mistakes: overrides.mistakes ?? 0,
    accuracy: overrides.accuracy ?? 100,
    stars: overrides.stars ?? 3,
    passed: overrides.passed ?? true,
    bestCombo: overrides.bestCombo ?? 12,
    coinsEarned: overrides.coinsEarned,
    xpEarned: overrides.xpEarned,
  }
}

describe('gamification rewards', () => {
  test('rewards completion, accuracy, perfect practice, combo, and daily milestones', () => {
    const reward = calculatePracticeReward(record({ id: 'first' }), [], new Date('2026-05-24T02:00:00.000Z'))

    expect(reward.coins).toBe(40)
    expect(reward.xp).toBe(42)
    expect(reward.reasons).toEqual([
      '完成练习 +10',
      '闯关通过 +5',
      '准确率90%以上 +5',
      '满分练习 +10',
      '连对10个 +5',
      '今日第1次练习 +5',
    ])
  })

  test('keeps the daily coin reward under the daily limit', () => {
    const previous = [
      record({ id: 'one', coinsEarned: 35 }),
      record({ id: 'two', coinsEarned: 35 }),
      record({ id: 'old', completedAt: '2026-05-23T01:00:00.000Z', coinsEarned: 80 }),
    ]

    const reward = calculatePracticeReward(
      record({ id: 'third' }),
      previous,
      new Date('2026-05-24T03:00:00.000Z'),
    )

    expect(getTodayCoinsEarned(previous, new Date('2026-05-24T03:00:00.000Z'))).toBe(70)
    expect(reward.coins).toBe(10)
    expect(reward.isCapped).toBe(true)
  })
})

describe('daily tasks', () => {
  test('summarizes today practice goals', () => {
    const tasks = buildDailyTasks(
      [
        record({ id: 'one', stars: 3, passed: true }),
        record({ id: 'two', stars: 2, passed: false }),
        record({ id: 'old', completedAt: '2026-05-23T01:00:00.000Z', stars: 3 }),
      ],
      new Date('2026-05-24T03:00:00.000Z'),
    )

    expect(tasks).toEqual([
      expect.objectContaining({ id: 'practice-3', progress: 2, target: 3, isComplete: false }),
      expect.objectContaining({ id: 'stars-6', progress: 5, target: 6, isComplete: false }),
      expect.objectContaining({ id: 'passes-2', progress: 1, target: 2, isComplete: false }),
    ])
  })
})
