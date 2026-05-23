import type { Lesson, PracticeRecord } from './types'

const CSV_HEADER = ['完成时间', '课程', '练习内容', '准确率', '小错误', '用时秒', '星星', '是否通过']

function escapeCsvCell(value: string | number): string {
  const text = String(value)

  if (!/[",\n\r]/.test(text)) {
    return text
  }

  return `"${text.replaceAll('"', '""')}"`
}

export function buildPracticeReportCsv(records: PracticeRecord[], lessons: Lesson[]): string {
  const lessonTitleById = new Map(lessons.map((lesson) => [lesson.id, lesson.title]))
  const rows = records.map((record) => [
    record.completedAt.slice(0, 10),
    lessonTitleById.get(record.lessonId) ?? record.lessonId,
    record.prompt,
    `${record.accuracy}%`,
    record.mistakes,
    Math.max(1, Math.round(record.durationMs / 1000)),
    record.stars,
    record.passed ? '是' : '否',
  ])

  return [CSV_HEADER, ...rows]
    .map((row) => row.map((cell) => escapeCsvCell(cell)).join(','))
    .join('\n')
}
