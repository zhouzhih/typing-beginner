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

  test('uses larger practice sets and stronger difficulty steps after home row', () => {
    const letterFriends = getLessonById('letter-friends')
    const tinyWords = getLessonById('tiny-words')
    const shortLines = getLessonById('short-lines')

    expect(letterFriends?.prompts.length).toBeGreaterThanOrEqual(12)
    expect(letterFriends?.prompts[0].replace(/\s/g, '').length).toBeGreaterThanOrEqual(16)
    expect(letterFriends?.prompts.every((prompt) => prompt.replace(/\s/g, '').length >= 14)).toBe(true)
    expect(letterFriends?.requiredPasses).toBe(4)
    expect(tinyWords?.prompts.length).toBeGreaterThanOrEqual(10)
    expect(tinyWords?.requiredPasses).toBe(5)
    expect(shortLines?.prompts.length).toBeGreaterThanOrEqual(10)
    expect(shortLines?.prompts.some((prompt) => /[A-Z]/.test(prompt) && /[.!?]/.test(prompt))).toBe(true)
  })
})
