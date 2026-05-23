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
    expect(data.createdAt).toEqual(expect.any(String))
  })

  test('saves and loads practice data', () => {
    const data: PracticeData = {
      records: [record()],
      lastLessonId: 'home-row',
      selectedMascotId: 'forest-ranger',
      customMascotImage: 'data:image/png;base64,abc',
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
})
