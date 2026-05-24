import '@testing-library/jest-dom/vitest'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { ProgressSummary } from './ProgressSummary'
import type { PracticeRecord } from '../domain/types'

function record(id: string, completedAt: string): PracticeRecord {
  return {
    id,
    lessonId: 'home-row',
    prompt: 'asdf',
    startedAt: '2026-05-23T01:00:00.000Z',
    completedAt,
    durationMs: 60_000,
    totalChars: 4,
    mistakes: 0,
    accuracy: 100,
    stars: 3,
    passed: true,
  }
}

describe('ProgressSummary', () => {
  test('keeps the recent practice list short in the sidebar', () => {
    render(
      <ProgressSummary
        coinBalance={0}
        mascotXp={0}
        records={[
          record('oldest', '2026-05-21T01:00:00.000Z'),
          record('middle', '2026-05-22T01:00:00.000Z'),
          record('newest', '2026-05-23T01:00:00.000Z'),
        ]}
      />,
    )

    const list = screen.getByRole('list', { name: '星星记录' })

    expect(within(list).getAllByRole('listitem')).toHaveLength(2)
  })

  test('shows coins, mascot level, and daily task progress', () => {
    render(
      <ProgressSummary
        coinBalance={45}
        mascotXp={70}
        records={[record('one', new Date().toISOString())]}
      />,
    )

    expect(screen.getByText('金币 45')).toBeInTheDocument()
    expect(screen.getByText('伙伴 Lv.2')).toBeInTheDocument()
    expect(screen.getByText('完成 3 次练习')).toBeInTheDocument()
  })
})
