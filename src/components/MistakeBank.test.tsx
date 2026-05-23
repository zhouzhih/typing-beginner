import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { MistakeBank } from './MistakeBank'
import type { PracticeRecord } from '../domain/types'

function record(id: string, mistakeKeys: string[]): PracticeRecord {
  return {
    id,
    lessonId: 'home-row',
    prompt: 'asdf',
    startedAt: '2026-05-23T01:00:00.000Z',
    completedAt: '2026-05-23T01:01:00.000Z',
    durationMs: 60_000,
    totalChars: 4,
    mistakes: mistakeKeys.length,
    mistakeKeys,
    accuracy: 90,
    stars: 2,
    passed: true,
  }
}

describe('MistakeBank', () => {
  test('shows frequently missed keys from practice records', () => {
    render(<MistakeBank records={[record('first', ['a', 'a', 's'])]} />)

    expect(screen.getByRole('heading', { name: '错题小本' })).toBeInTheDocument()
    expect(screen.getByText('a')).toBeInTheDocument()
    expect(screen.getByText('2 次')).toBeInTheDocument()
  })

  test('shows an empty state before mistakes are recorded', () => {
    render(<MistakeBank records={[]} />)

    expect(screen.getByText('还没有常错键，继续保持。')).toBeInTheDocument()
  })
})
