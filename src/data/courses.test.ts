import { describe, expect, test } from 'vitest'

import { courses, getAllLessons, getLessonById } from './courses'

describe('courses', () => {
  test('provides active English lessons and a coming-soon pinyin course', () => {
    expect(courses[0].id).toBe('english-foundation')
    expect(courses[0].status).toBe('active')
    expect(courses[0].lessons.length).toBeGreaterThanOrEqual(4)

    expect(courses.some((course) => course.id === 'pinyin-starter' && course.status === 'coming-soon')).toBe(true)
  })

  test('finds lessons by id across active courses', () => {
    expect(getAllLessons().map((lesson) => lesson.id)).toContain('home-row')
    expect(getLessonById('home-row')?.title).toBe('手指的家')
  })
})
