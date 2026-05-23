import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test } from 'vitest'

import App from './App'
import type { PracticeRecord } from '../domain/types'
import { loadPracticeData, savePracticeData } from '../storage/practiceStorage'

function passedRecord(id: string, lessonId = 'home-row'): PracticeRecord {
  return {
    id,
    lessonId,
    prompt: 'asdf jkl;',
    startedAt: '2026-05-23T01:00:00.000Z',
    completedAt: '2026-05-23T01:01:00.000Z',
    durationMs: 60_000,
    totalChars: 9,
    mistakes: 0,
    accuracy: 100,
    stars: 3,
    passed: true,
  }
}

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

  test('opens the compact typing buddy panel and keeps custom avatars local', async () => {
    const user = userEvent.setup()

    render(<App />)

    expect(screen.getByRole('button', { name: '打开打字伙伴' })).toBeInTheDocument()
    expect(screen.queryByLabelText('选择打字伙伴')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '打开打字伙伴' }))

    expect(screen.getByRole('dialog', { name: '打字伙伴' })).toBeInTheDocument()
    expect(screen.getByLabelText('选择打字伙伴')).toHaveValue('keyboard-sprite')
    expect(screen.getByAltText('键盘小精灵头像')).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('选择打字伙伴'), 'forest-ranger')
    expect(loadPracticeData(localStorage).selectedMascotId).toBe('forest-ranger')
    expect(screen.getByAltText('森林小游侠头像')).toBeInTheDocument()

    const upload = new File(['avatar'], 'avatar.png', { type: 'image/png' })
    await user.upload(screen.getByLabelText('上传本机头像'), upload)

    expect(loadPracticeData(localStorage).customMascotImage).toMatch(/^data:image\/png;base64,/)
    expect(screen.getByText('自定义头像只保存在本机')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '关闭打字伙伴' }))

    expect(screen.queryByRole('dialog', { name: '打字伙伴' })).not.toBeInTheDocument()
  })

  test('shows a longer letter-friends prompt and lesson progress', () => {
    savePracticeData(
      {
        createdAt: '2026-05-23T00:00:00.000Z',
        lastLessonId: 'letter-friends',
        selectedMascotId: 'keyboard-sprite',
        customMascotImage: '',
        records: [passedRecord('home-row-1'), passedRecord('home-row-2')],
      },
      localStorage,
    )

    render(<App />)

    expect(screen.getByRole('heading', { name: '字母朋友' })).toBeInTheDocument()
    expect(screen.getByText('第 1 / 12 题')).toBeInTheDocument()
    expect(screen.getByLabelText('练习内容').textContent?.replace(/\s/g, '').length).toBeGreaterThanOrEqual(16)
  })
})
