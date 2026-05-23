import type { PracticeRecord } from './types'

export function calculateAccuracy(totalChars: number, mistakes: number): number {
  if (totalChars <= 0) {
    return 100
  }

  return Math.max(0, Math.round(((totalChars - mistakes) / totalChars) * 100))
}

export function calculateStars(accuracy: number): PracticeRecord['stars'] {
  if (accuracy >= 95) {
    return 3
  }

  if (accuracy >= 85) {
    return 2
  }

  return 1
}

export function isPassed(accuracy: number, isComplete: boolean): boolean {
  return isComplete && accuracy >= 85
}

export function calculateDurationMs(startedAt: string, completedAt: string): number {
  return Math.max(0, new Date(completedAt).getTime() - new Date(startedAt).getTime())
}
