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
        records={[
          record('oldest', '2026-05-21T01:00:00.000Z'),
          record('middle', '2026-05-22T01:00:00.000Z'),
          record('newest', '2026-05-23T01:00:00.000Z'),
        ]}
      />,
    )

    const list = screen.getByRole('list')

    expect(within(list).getAllByRole('listitem')).toHaveLength(2)
  })
})
