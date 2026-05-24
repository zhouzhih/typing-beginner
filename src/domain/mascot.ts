import type { PracticeRecord } from './types'

export type MascotId =
  | 'keyboard-sprite'
  | 'round-bean'
  | 'red-crafter'
  | 'pixel-hero'
  | 'forest-ranger'
  | 'custom'

export type RewardId = 'star-sticker' | 'keycap-crown' | 'hero-cape' | 'gold-medal'

export type MascotReward = {
  id: RewardId
  title: string
  cost: number
  unlockLevel: 1 | 2 | 3 | 4 | 5
}

export const rewards: MascotReward[] = [
  { id: 'star-sticker', title: '星星贴纸', cost: 20, unlockLevel: 1 },
  { id: 'keycap-crown', title: '键帽皇冠', cost: 35, unlockLevel: 2 },
  { id: 'hero-cape', title: '小披风', cost: 55, unlockLevel: 3 },
  { id: 'gold-medal', title: '金色奖章', cost: 75, unlockLevel: 4 },
]

function getPassedRecords(records: PracticeRecord[]): PracticeRecord[] {
  return records.filter((record) => record.passed)
}

export function getMascotLevel(records: PracticeRecord[]): 1 | 2 | 3 | 4 {
  const passedCount = getPassedRecords(records).length

  if (passedCount >= 6) {
    return 4
  }

  if (passedCount >= 4) {
    return 3
  }

  if (passedCount >= 2) {
    return 2
  }

  return 1
}

export function getMascotLevelFromXp(xp: number): 1 | 2 | 3 | 4 | 5 {
  if (xp >= 420) {
    return 5
  }

  if (xp >= 260) {
    return 4
  }

  if (xp >= 140) {
    return 3
  }

  if (xp >= 60) {
    return 2
  }

  return 1
}

export function getNextMascotLevelXp(xp: number): number {
  return [60, 140, 260, 420].find((threshold) => xp < threshold) ?? 420
}

export function getPurchasableRewards(level: number): MascotReward[] {
  return rewards.filter((reward) => reward.unlockLevel <= level)
}

export function getRewardsByIds(rewardIds: string[]): MascotReward[] {
  const rewardSet = new Set(rewardIds)

  return rewards.filter((reward) => rewardSet.has(reward.id))
}

export function getUnlockedRewards(records: PracticeRecord[]): MascotReward[] {
  const passedCount = getPassedRecords(records).length
  const totalStars = records.reduce((sum, record) => sum + record.stars, 0)

  return rewards.filter((reward) => {
    if (reward.id === 'star-sticker') {
      return passedCount >= 1
    }

    if (reward.id === 'keycap-crown') {
      return passedCount >= 2
    }

    if (reward.id === 'hero-cape') {
      return passedCount >= 4
    }

    return totalStars >= 9
  })
}
