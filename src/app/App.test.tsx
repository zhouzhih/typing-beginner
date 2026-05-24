import '@testing-library/jest-dom/vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import App from './App'
import type { PracticeRecord } from '../domain/types'
import { loadPracticeData, savePracticeData } from '../storage/practiceStorage'

const originalCreateObjectURL = URL.createObjectURL
const originalRevokeObjectURL = URL.revokeObjectURL

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

  afterEach(() => {
    vi.restoreAllMocks()
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: originalCreateObjectURL,
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: originalRevokeObjectURL,
    })
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
    expect(data.records[0].coinsEarned).toBeGreaterThan(0)
    expect(data.records[0].xpEarned).toBeGreaterThan(0)
    expect(data.coinBalance).toBe(data.records[0].coinsEarned)
    expect(data.mascotXp).toBe(data.records[0].xpEarned)
    expect(screen.getByText(/获得 .* 金币/)).toBeInTheDocument()
  })

  test('keeps mistakes after a child deletes and corrects the input', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: '开始' }))
    const input = screen.getByLabelText('打字输入框')
    const mistakeFeedback = screen.getByText('小错误').closest('div')

    expect(mistakeFeedback).not.toBeNull()

    await user.type(input, 'x')
    expect(mistakeFeedback).toHaveTextContent('小错误1')

    await user.keyboard('{Backspace}')
    expect(mistakeFeedback).toHaveTextContent('小错误1')

    await user.type(input, 'asdf jkl;')

    const data = loadPracticeData(localStorage)
    expect(data.records).toHaveLength(1)
    expect(data.records[0].mistakes).toBe(1)
    expect(data.records[0].mistakeKeys).toEqual(['a'])
    expect(data.records[0].accuracy).toBe(89)
    expect(within(screen.getByRole('region', { name: '错题小本' })).getByText('a')).toBeInTheDocument()
  })

  test('exports saved practice results as a csv file', async () => {
    const user = userEvent.setup()
    const createObjectURL = vi.fn(() => 'blob:typing-report')
    const revokeObjectURL = vi.fn()
    const anchorClick = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: createObjectURL,
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: revokeObjectURL,
    })

    render(<App />)

    await user.click(screen.getByRole('button', { name: '开始' }))
    await user.type(screen.getByLabelText('打字输入框'), 'asdf jkl;')
    await user.click(await screen.findByRole('button', { name: '导出成绩' }))

    const reportBlob = createObjectURL.mock.calls[0][0] as Blob

    expect(reportBlob.type).toBe('text/csv;charset=utf-8')
    await expect(reportBlob.arrayBuffer()).resolves.toSatisfy((buffer: ArrayBuffer) => {
      const bytes = new Uint8Array(buffer)

      return bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf
    })
    await expect(reportBlob.text()).resolves.toContain('手指的家,asdf jkl;,100%,0')
    expect(anchorClick).toHaveBeenCalledTimes(1)
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:typing-report')
  })

  test('focuses the typing input when practice starts', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: '开始' }))

    expect(screen.getByLabelText('打字输入框')).toHaveFocus()
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

    await user.click(screen.getByRole('button', { name: '和伙伴击掌' }))
    expect(screen.getByText('伙伴开心 +1')).toBeInTheDocument()

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

  test('lets a child switch the page style and saves it', async () => {
    const user = userEvent.setup()

    render(<App />)

    expect(screen.getByRole('group', { name: '页面风格' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '天空蓝' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '星空夜' }))

    expect(loadPracticeData(localStorage).selectedThemeId).toBe('space')
    expect(screen.getByRole('button', { name: '星空夜' })).toHaveAttribute('aria-pressed', 'true')
  })

  test('shows a longer letter-friends prompt and lesson progress', () => {
    savePracticeData(
      {
        createdAt: '2026-05-23T00:00:00.000Z',
        lastLessonId: 'letter-friends',
        selectedMascotId: 'keyboard-sprite',
        customMascotImage: '',
        selectedThemeId: 'meadow',
        coinBalance: 0,
        mascotXp: 0,
        ownedRewardIds: [],
        equippedRewardIds: [],
        records: [passedRecord('home-row-1'), passedRecord('home-row-2')],
      },
      localStorage,
    )

    render(<App />)

    expect(screen.getByRole('heading', { name: '字母朋友' })).toBeInTheDocument()
    expect(screen.getByText('第 1 / 12 题')).toBeInTheDocument()
    expect(screen.getByLabelText('练习内容').textContent?.replace(/\s/g, '').length).toBeGreaterThanOrEqual(16)
  })

  test('lets a child practice pinyin from chinese labels', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: '1 拼音入门 可练习' }))

    expect(screen.getByRole('heading', { name: '拼音入门' })).toBeInTheDocument()
    expect(screen.getByText('妈妈 爸爸')).toBeInTheDocument()
    expect(screen.getByLabelText('练习内容')).toHaveTextContent('ma ma ba ba')
  })

  test('shows english learning hints for grammar and story typing', () => {
    savePracticeData(
      {
        createdAt: '2026-05-23T00:00:00.000Z',
        lastLessonId: 'grammar-lines',
        selectedMascotId: 'keyboard-sprite',
        customMascotImage: '',
        selectedThemeId: 'meadow',
        coinBalance: 0,
        mascotXp: 0,
        ownedRewardIds: [],
        equippedRewardIds: [],
        records: [
          passedRecord('home-row-1'),
          passedRecord('home-row-2'),
          passedRecord('letter-1', 'letter-friends'),
          passedRecord('letter-2', 'letter-friends'),
          passedRecord('letter-3', 'letter-friends'),
          passedRecord('letter-4', 'letter-friends'),
          passedRecord('words-1', 'tiny-words'),
          passedRecord('words-2', 'tiny-words'),
          passedRecord('words-3', 'tiny-words'),
          passedRecord('words-4', 'tiny-words'),
          passedRecord('words-5', 'tiny-words'),
          passedRecord('lines-1', 'short-lines'),
          passedRecord('lines-2', 'short-lines'),
          passedRecord('lines-3', 'short-lines'),
          passedRecord('lines-4', 'short-lines'),
          passedRecord('lines-5', 'short-lines'),
          passedRecord('lines-6', 'short-lines'),
        ],
      },
      localStorage,
    )

    render(<App />)

    expect(screen.getByRole('heading', { name: '语法小句' })).toBeInTheDocument()
    expect(screen.getByText('I am = 我是 / 我很')).toBeInTheDocument()
    expect(screen.getByLabelText('练习内容')).toHaveTextContent('I am a happy kid.')
  })
})
