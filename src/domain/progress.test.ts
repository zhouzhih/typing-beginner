import { describe, expect, test } from 'vitest'

import { getPracticeStreak, getRecentRecords, isLessonUnlocked } from './progress'
import type { Lesson, PracticeRecord } from './types'

const firstLesson: Lesson = {
  id: 'home-row',
  title: '手指的家',
  level: 1,
  kind: 'characters',
  prompts: ['asdf jkl;'],
}

const secondLesson: Lesson = {
  id: 'letters',
  title: '字母朋友',
  level: 2,
  kind: 'characters',
  prompts: ['asdf ghjk'],
  unlockAfter: 'home-row',
}

function record(overrides: Partial<PracticeRecord>): PracticeRecord {
  return {
    id: overrides.id ?? crypto.randomUUID(),
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

describe('progress helpers', () => {
  test('unlocks the first lesson without records', () => {
    expect(isLessonUnlocked(firstLesson, [])).toBe(true)
  })

  test('unlocks a later lesson after two passed prerequisite records', () => {
    const records = [
      record({ id: 'first-pass', lessonId: 'home-row', passed: true }),
      record({ id: 'second-pass', lessonId: 'home-row', passed: true }),
    ]

    expect(isLessonUnlocked(secondLesson, records)).toBe(true)
  })

  test('uses the prerequisite required pass count when it is higher than the default', () => {
    const harderFirstLesson = {
      ...firstLesson,
      requiredPasses: 3,
    } as Lesson & { requiredPasses: number }
    const records = [
      record({ id: 'first-pass', lessonId: 'home-row', passed: true }),
      record({ id: 'second-pass', lessonId: 'home-row', passed: true }),
    ]

    expect(isLessonUnlocked(secondLesson, records, [harderFirstLesson, secondLesson])).toBe(false)
    expect(
      isLessonUnlocked(
        secondLesson,
        [...records, record({ id: 'third-pass', lessonId: 'home-row', passed: true })],
        [harderFirstLesson, secondLesson],
      ),
    ).toBe(true)
  })

  test('keeps a later lesson locked until prerequisite is passed twice', () => {
    const records = [
      record({ id: 'first-pass', lessonId: 'home-row', passed: true }),
      record({ id: 'miss', lessonId: 'home-row', passed: false }),
    ]

    expect(isLessonUnlocked(secondLesson, records)).toBe(false)
  })

  test('counts consecutive practice days ending today', () => {
    const records = [
      record({ id: 'today', completedAt: '2026-05-23T09:00:00.000Z' }),
      record({ id: 'yesterday', completedAt: '2026-05-22T09:00:00.000Z' }),
      record({ id: 'two-days-ago', completedAt: '2026-05-21T09:00:00.000Z' }),
      record({ id: 'gap', completedAt: '2026-05-19T09:00:00.000Z' }),
    ]

    expect(getPracticeStreak(records, new Date('2026-05-23T12:00:00.000Z'))).toBe(3)
  })

  test('returns newest recent records first', () => {
    const records = [
      record({ id: 'oldest', completedAt: '2026-05-21T09:00:00.000Z' }),
      record({ id: 'newest', completedAt: '2026-05-23T09:00:00.000Z' }),
      record({ id: 'middle', completedAt: '2026-05-22T09:00:00.000Z' }),
    ]

    expect(getRecentRecords(records, 2).map((item) => item.id)).toEqual(['newest', 'middle'])
  })
})
