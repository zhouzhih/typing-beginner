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
}

export const rewards: MascotReward[] = [
  { id: 'star-sticker', title: '星星贴纸' },
  { id: 'keycap-crown', title: '键帽皇冠' },
  { id: 'hero-cape', title: '小披风' },
  { id: 'gold-medal', title: '金色奖章' },
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
