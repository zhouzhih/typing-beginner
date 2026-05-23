import { describe, expect, test } from 'vitest'

import { buildPracticeReportCsv } from './report'
import type { Lesson, PracticeRecord } from './types'

const lesson: Lesson = {
  id: 'home-row',
  title: '手指的家',
  level: 1,
  kind: 'characters',
  prompts: ['asdf'],
}

const record: PracticeRecord = {
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
}

describe('buildPracticeReportCsv', () => {
  test('exports practice records with lesson names and kid friendly columns', () => {
    const csv = buildPracticeReportCsv([record], [lesson])

    expect(csv).toContain('完成时间,课程,练习内容,准确率,小错误,用时秒,星星,是否通过')
    expect(csv).toContain('2026-05-23,手指的家,asdf,100%,0,8,3,是')
  })

  test('escapes commas and quotes in typed prompts', () => {
    const csv = buildPracticeReportCsv([{ ...record, prompt: 'a,"b"' }], [lesson])

    expect(csv).toContain('"a,""b"""')
  })
})
