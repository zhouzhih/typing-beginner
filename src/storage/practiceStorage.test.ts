import { beforeEach, describe, expect, test } from 'vitest'

import { loadPracticeData, savePracticeData, STORAGE_KEY } from './practiceStorage'
import type { PracticeData } from './practiceStorage'
import type { PracticeRecord } from '../domain/types'

function record(): PracticeRecord {
  return {
    id: 'record-1',
    lessonId: 'home-row',
    prompt: 'asdf',
    startedAt: '2026-05-23T01:00:00.000Z',
    completedAt: '2026-05-23T01:01:00.000Z',
    durationMs: 60_000,
    totalChars: 4,
    mistakes: 0,
    accuracy: 100,
    stars: 3,
    passed: true,
  }
}

describe('practiceStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('loads default data when storage is empty', () => {
    const data = loadPracticeData(localStorage)

    expect(data.records).toEqual([])
    expect(data.lastLessonId).toBe('home-row')
    expect(data.selectedMascotId).toBe('keyboard-sprite')
    expect(data.customMascotImage).toBe('')
    expect(data.selectedThemeId).toBe('meadow')
    expect(data.coinBalance).toBe(0)
    expect(data.mascotXp).toBe(0)
    expect(data.ownedRewardIds).toEqual([])
    expect(data.equippedRewardIds).toEqual([])
    expect(data.createdAt).toEqual(expect.any(String))
  })

  test('saves and loads practice data', () => {
    const data: PracticeData = {
      records: [record()],
      lastLessonId: 'home-row',
      selectedMascotId: 'forest-ranger',
      customMascotImage: 'data:image/png;base64,abc',
      selectedThemeId: 'space',
      coinBalance: 120,
      mascotXp: 80,
      ownedRewardIds: ['star-sticker'],
      equippedRewardIds: ['star-sticker'],
      createdAt: '2026-05-23T01:00:00.000Z',
    }

    savePracticeData(data, localStorage)

    expect(loadPracticeData(localStorage)).toEqual(data)
  })

  test('falls back to default data when stored JSON is damaged', () => {
    localStorage.setItem(STORAGE_KEY, '{not-json')

    const data = loadPracticeData(localStorage)

    expect(data.records).toEqual([])
    expect(data.lastLessonId).toBe('home-row')
  })

  test('keeps previously unlocked mascot rewards when loading older saved data', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        records: [
          record(),
          { ...record(), id: 'record-2' },
          { ...record(), id: 'record-3' },
          { ...record(), id: 'record-4' },
        ],
        lastLessonId: 'home-row',
        selectedMascotId: 'keyboard-sprite',
        customMascotImage: '',
        selectedThemeId: 'meadow',
        createdAt: '2026-05-23T01:00:00.000Z',
      }),
    )

    const data = loadPracticeData(localStorage)

    expect(data.ownedRewardIds).toEqual([
      'star-sticker',
      'keycap-crown',
      'hero-cape',
      'gold-medal',
    ])
    expect(data.equippedRewardIds).toEqual(data.ownedRewardIds)
  })
})
