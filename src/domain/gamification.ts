import type { PracticeRecord } from './types'

export const DAILY_COIN_LIMIT = 80

export type PracticeReward = {
  coins: number
  xp: number
  reasons: string[]
  isCapped: boolean
}

export type DailyTask = {
  id: string
  title: string
  progress: number
  target: number
  rewardText: string
  isComplete: boolean
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function recordDateKey(record: PracticeRecord): string {
  return record.completedAt.slice(0, 10)
}

function isSameDay(record: PracticeRecord, today: Date): boolean {
  return recordDateKey(record) === toDateKey(today)
}

export function getTodayRecords(
  records: PracticeRecord[],
  today: Date = new Date(),
): PracticeRecord[] {
  return records.filter((record) => isSameDay(record, today))
}

export function getTodayCoinsEarned(
  records: PracticeRecord[],
  today: Date = new Date(),
): number {
  return getTodayRecords(records, today).reduce((sum, record) => sum + (record.coinsEarned ?? 0), 0)
}

function addCoin(reason: string, coins: number, reasons: string[]): number {
  reasons.push(`${reason} +${coins}`)
  return coins
}

export function calculatePracticeReward(
  record: PracticeRecord,
  previousRecords: PracticeRecord[],
  today: Date = new Date(),
): PracticeReward {
  const reasons: string[] = []
  let rawCoins = addCoin('完成练习', 10, reasons)

  if (record.passed) {
    rawCoins += addCoin('闯关通过', 5, reasons)
  }

  if (record.accuracy >= 90) {
    rawCoins += addCoin('准确率90%以上', 5, reasons)
  }

  if (record.accuracy === 100) {
    rawCoins += addCoin('满分练习', 10, reasons)
  }

  if ((record.bestCombo ?? 0) >= 10) {
    rawCoins += addCoin('连对10个', 5, reasons)
  }

  const todayPracticeCount = getTodayRecords(previousRecords, today).length + 1
  if ([1, 3, 5].includes(todayPracticeCount)) {
    rawCoins += addCoin(`今日第${todayPracticeCount}次练习`, 5, reasons)
  }

  const remainingCoins = Math.max(0, DAILY_COIN_LIMIT - getTodayCoinsEarned(previousRecords, today))
  const coins = Math.min(rawCoins, remainingCoins)
  const comboBonus = Math.floor((record.bestCombo ?? 0) / 10) * 4
  const xp = 12 + record.stars * 6 + (record.passed ? 8 : 0) + comboBonus

  return {
    coins,
    xp,
    reasons,
    isCapped: coins < rawCoins,
  }
}

export function buildDailyTasks(
  records: PracticeRecord[],
  today: Date = new Date(),
): DailyTask[] {
  const todayRecords = getTodayRecords(records, today)
  const todayStars = todayRecords.reduce((sum, record) => sum + record.stars, 0)
  const todayPasses = todayRecords.filter((record) => record.passed).length

  return [
    {
      id: 'practice-3',
      title: '完成 3 次练习',
      progress: todayRecords.length,
      target: 3,
      rewardText: '今日小习惯',
      isComplete: todayRecords.length >= 3,
    },
    {
      id: 'stars-6',
      title: '收集 6 颗星',
      progress: todayStars,
      target: 6,
      rewardText: '星星收集家',
      isComplete: todayStars >= 6,
    },
    {
      id: 'passes-2',
      title: '通过 2 次课程',
      progress: todayPasses,
      target: 2,
      rewardText: '闯关小能手',
      isComplete: todayPasses >= 2,
    },
  ]
}
