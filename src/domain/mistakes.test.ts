import { describe, expect, test } from 'vitest'

import { getFrequentMistakeKeys } from './mistakes'
import type { PracticeRecord } from './types'

function record(id: string, mistakeKeys: string[] = []): PracticeRecord {
  return {
    id,
    lessonId: 'home-row',
    prompt: 'asdf',
    startedAt: '2026-05-23T01:00:00.000Z',
    completedAt: '2026-05-23T01:01:00.000Z',
    durationMs: 60_000,
    totalChars: 4,
    mistakes: mistakeKeys.length,
    mistakeKeys,
    accuracy: 100,
    stars: 3,
    passed: true,
  }
}

describe('getFrequentMistakeKeys', () => {
  test('counts and sorts the most frequently missed keys', () => {
    const records = [record('first', ['a', 's', 'a']), record('second', ['d', 'a'])]

    expect(getFrequentMistakeKeys(records, 2)).toEqual([
      { key: 'a', count: 3 },
      { key: 'd', count: 1 },
    ])
  })

  test('falls back to comparing prompt and input-like records from older history', () => {
    const records = [record('legacy', [])]

    expect(getFrequentMistakeKeys(records, 3)).toEqual([])
  })
})
