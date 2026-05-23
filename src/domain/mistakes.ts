import type { PracticeRecord } from './types'

export type FrequentMistakeKey = {
  key: string
  count: number
}

export function getFrequentMistakeKeys(
  records: PracticeRecord[],
  limit: number,
): FrequentMistakeKey[] {
  const counts = new Map<string, number>()

  for (const record of records) {
    for (const key of record.mistakeKeys ?? []) {
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  }

  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((left, right) => right.count - left.count || left.key.localeCompare(right.key))
    .slice(0, limit)
}
