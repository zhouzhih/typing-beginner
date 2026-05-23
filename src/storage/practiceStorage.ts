import type { PracticeRecord } from '../domain/types'
import type { MascotId } from '../domain/mascot'
import { getThemeById, type ThemeId } from '../domain/theme'

export const STORAGE_KEY = 'typing-beginner:v1'

export type PracticeData = {
  records: PracticeRecord[]
  lastLessonId: string
  selectedMascotId: MascotId
  customMascotImage: string
  selectedThemeId: ThemeId
  createdAt: string
}

function createDefaultData(): PracticeData {
  return {
    records: [],
    lastLessonId: 'home-row',
    selectedMascotId: 'keyboard-sprite',
    customMascotImage: '',
    selectedThemeId: 'meadow',
    createdAt: new Date().toISOString(),
  }
}

function isPracticeData(value: unknown): value is PracticeData {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as PracticeData
  return Array.isArray(candidate.records) && typeof candidate.lastLessonId === 'string'
}

function normalizePracticeData(data: PracticeData): PracticeData {
  return {
    records: data.records,
    lastLessonId: data.lastLessonId,
    selectedMascotId: data.selectedMascotId ?? 'keyboard-sprite',
    customMascotImage: data.customMascotImage ?? '',
    selectedThemeId: getThemeById(data.selectedThemeId).id,
    createdAt: data.createdAt ?? new Date().toISOString(),
  }
}

export function loadPracticeData(storage: Storage = window.localStorage): PracticeData {
  const stored = storage.getItem(STORAGE_KEY)

  if (!stored) {
    return createDefaultData()
  }

  try {
    const parsed = JSON.parse(stored) as unknown
    return isPracticeData(parsed) ? normalizePracticeData(parsed) : createDefaultData()
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
