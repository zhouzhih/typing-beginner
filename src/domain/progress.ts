import type { Lesson, PracticeRecord } from './types'

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

export function isLessonUnlocked(lesson: Lesson, records: PracticeRecord[]): boolean {
  if (!lesson.unlockAfter) {
    return true
  }

  const passedPrerequisiteCount = records.filter(
    (record) => record.lessonId === lesson.unlockAfter && record.passed,
  ).length

  return passedPrerequisiteCount >= 2
}

export function getPracticeStreak(records: PracticeRecord[], today: Date = new Date()): number {
  const practicedDays = new Set(records.map((record) => toDateKey(new Date(record.completedAt))))
  let streak = 0
  let cursor = today

  while (practicedDays.has(toDateKey(cursor))) {
    streak += 1
    cursor = addDays(cursor, -1)
  }

  return streak
}

export function getRecentRecords(records: PracticeRecord[], limit: number): PracticeRecord[] {
  return [...records]
    .sort((left, right) => new Date(right.completedAt).getTime() - new Date(left.completedAt).getTime())
    .slice(0, limit)
}
