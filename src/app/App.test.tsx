import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test } from 'vitest'

import App from './App'
import { loadPracticeData } from '../storage/practiceStorage'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('lets a beginner complete the first typing lesson and saves history', async () => {
    const user = userEvent.setup()

    render(<App />)

    expect(screen.getByRole('heading', { name: '打字小课堂' })).toBeInTheDocument()
    expect(screen.getByText('再通过 2 次，就能解锁「字母朋友」')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '开始' }))
    await user.type(screen.getByLabelText('打字输入框'), 'asdf jkl;')

    expect(await screen.findByText('本关星星')).toBeInTheDocument()
    expect(screen.getByText('准确率 100%')).toBeInTheDocument()
    expect(screen.getByText('再通过 1 次，就能解锁「字母朋友」')).toBeInTheDocument()
    expect(screen.getByLabelText('练习内容').textContent?.replace(/\s/g, '')).toBe('asdfjkl;')

    const data = loadPracticeData(localStorage)
    expect(data.records).toHaveLength(1)
    expect(data.records[0].lessonId).toBe('home-row')
    expect(data.records[0].passed).toBe(true)
  })
})
