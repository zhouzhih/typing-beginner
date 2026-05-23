import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { KeyboardTips } from './KeyboardTips'

describe('KeyboardTips', () => {
  test('shows compact keyboard knowledge for young beginners', () => {
    render(<KeyboardTips />)

    expect(screen.getByRole('heading', { name: '键盘小知识' })).toBeInTheDocument()
    expect(screen.getByText('Shift')).toBeInTheDocument()
    expect(screen.getByText('Backspace')).toBeInTheDocument()
  })
})
