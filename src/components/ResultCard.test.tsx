import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'

import { ResultCard } from './ResultCard'
import type { PracticeRecord } from '../domain/types'

const result: PracticeRecord = {
  id: 'record-1',
  lessonId: 'home-row',
  prompt: 'asdf',
  startedAt: '2026-05-23T01:00:00.000Z',
  completedAt: '2026-05-23T01:00:08.000Z',
  durationMs: 8_000,
  totalChars: 4,
  mistakes: 0,
  accuracy: 100,
  stars: 3,
  passed: true,
  bestCombo: 12,
  coinsEarned: 40,
  xpEarned: 42,
}

describe('ResultCard', () => {
  test('lets a parent export the latest score after practice', async () => {
    const user = userEvent.setup()
    const onExportResults = vi.fn()

    render(
      <ResultCard
        result={result}
        saveWarning=""
        unlockHint="再通过 1 次，就能解锁「字母朋友」"
        onExportResults={onExportResults}
        onRetry={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: '导出成绩' }))

    expect(onExportResults).toHaveBeenCalledTimes(1)
  })

  test('shows coins and mascot experience from the latest practice', () => {
    render(
      <ResultCard
        result={result}
        saveWarning=""
        unlockHint="再通过 1 次，就能解锁「字母朋友」"
        onExportResults={vi.fn()}
        onRetry={vi.fn()}
      />,
    )

    expect(screen.getByText('获得 40 金币')).toBeInTheDocument()
    expect(screen.getByText('伙伴经验 +42')).toBeInTheDocument()
    expect(screen.getByText('最高连对 12')).toBeInTheDocument()
  })
})
