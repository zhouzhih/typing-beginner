import type { PracticeRecord } from '../domain/types'

export const STORAGE_KEY = 'typing-beginner:v1'

export type PracticeData = {
  records: PracticeRecord[]
  lastLessonId: string
  createdAt: string
}

function createDefaultData(): PracticeData {
  return {
    records: [],
    lastLessonId: 'home-row',
    createdAt: new Date().toISOString(),
  }
}

function isPracticeData(value: unknown): value is PracticeData {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as PracticeData
  return (
    Array.isArray(candidate.records) &&
    typeof candidate.lastLessonId === 'string' &&
    typeof candidate.createdAt === 'string'
  )
}

export function loadPracticeData(storage: Storage = window.localStorage): PracticeData {
  const stored = storage.getItem(STORAGE_KEY)

  if (!stored) {
    return createDefaultData()
  }

  try {
    const parsed = JSON.parse(stored) as unknown
    return isPracticeData(parsed) ? parsed : createDefaultData()
  } catch (error) {
    console.error('Unable to read practice history.', error)
    return createDefaultData()
  }
}

export function savePracticeData(
  data: PracticeData,
  storage: Storage = window.localStorage,
): { ok: true } | { ok: false; error: unknown } {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data))
    return { ok: true }
  } catch (error) {
    console.error('Unable to save practice history.', error)
    return { ok: false, error }
  }
}
