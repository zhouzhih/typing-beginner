import type { PracticeRecord } from '../domain/types'
import { getUnlockedRewards, rewards, type MascotId, type RewardId } from '../domain/mascot'
import { getThemeById, type ThemeId } from '../domain/theme'

export const STORAGE_KEY = 'typing-beginner:v1'

export type PracticeData = {
  records: PracticeRecord[]
  lastLessonId: string
  selectedMascotId: MascotId
  customMascotImage: string
  selectedThemeId: ThemeId
  coinBalance: number
  mascotXp: number
  ownedRewardIds: RewardId[]
  equippedRewardIds: RewardId[]
  createdAt: string
}

function createDefaultData(): PracticeData {
  return {
    records: [],
    lastLessonId: 'home-row',
    selectedMascotId: 'keyboard-sprite',
    customMascotImage: '',
    selectedThemeId: 'meadow',
    coinBalance: 0,
    mascotXp: 0,
    ownedRewardIds: [],
    equippedRewardIds: [],
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

function normalizeRewardIds(rewardIds: unknown): RewardId[] {
  if (!Array.isArray(rewardIds)) {
    return []
  }

  const validRewardIds = new Set(rewards.map((reward) => reward.id))

  return rewardIds.filter((rewardId): rewardId is RewardId => validRewardIds.has(rewardId))
}

function normalizePracticeData(data: PracticeData): PracticeData {
  const hasStoredOwnedRewards = Array.isArray(data.ownedRewardIds)
  const ownedRewardIds = hasStoredOwnedRewards
    ? normalizeRewardIds(data.ownedRewardIds)
    : getUnlockedRewards(data.records).map((reward) => reward.id)
  const ownedRewardSet = new Set(ownedRewardIds)
  const equippedRewardIds = hasStoredOwnedRewards
    ? normalizeRewardIds(data.equippedRewardIds).filter((rewardId) => ownedRewardSet.has(rewardId))
    : ownedRewardIds

  return {
    records: data.records,
    lastLessonId: data.lastLessonId,
    selectedMascotId: data.selectedMascotId ?? 'keyboard-sprite',
    customMascotImage: data.customMascotImage ?? '',
    selectedThemeId: getThemeById(data.selectedThemeId).id,
    coinBalance: Math.max(0, data.coinBalance ?? 0),
    mascotXp: Math.max(0, data.mascotXp ?? 0),
    ownedRewardIds,
    equippedRewardIds,
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
