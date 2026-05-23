import { describe, expect, test } from 'vitest'

import { courses, getAllLessons, getLessonById } from './courses'

describe('courses', () => {
  test('provides active English and pinyin lessons', () => {
    expect(courses[0].id).toBe('english-foundation')
    expect(courses[0].status).toBe('active')
    expect(courses[0].lessons.length).toBeGreaterThanOrEqual(6)

    const pinyinCourse = courses.find((course) => course.id === 'pinyin-starter')

    expect(pinyinCourse?.status).toBe('active')
    expect(pinyinCourse?.lessons.length).toBeGreaterThanOrEqual(3)
  })

  test('finds lessons by id across active courses', () => {
    expect(getAllLessons().map((lesson) => lesson.id)).toContain('home-row')
    expect(getLessonById('home-row')?.title).toBe('手指的家')
  })

  test('uses larger practice sets and stronger difficulty steps after home row', () => {
    const letterFriends = getLessonById('letter-friends')
    const tinyWords = getLessonById('tiny-words')
    const shortLines = getLessonById('short-lines')
    const grammarLines = getLessonById('grammar-lines')
    const storyTyping = getLessonById('story-typing')

    expect(letterFriends?.prompts.length).toBeGreaterThanOrEqual(12)
    expect(letterFriends?.prompts[0].replace(/\s/g, '').length).toBeGreaterThanOrEqual(16)
    expect(letterFriends?.prompts.every((prompt) => prompt.replace(/\s/g, '').length >= 14)).toBe(true)
    expect(letterFriends?.requiredPasses).toBe(4)
    expect(tinyWords?.prompts.length).toBeGreaterThanOrEqual(10)
    expect(tinyWords?.requiredPasses).toBe(5)
    expect(shortLines?.prompts.length).toBeGreaterThanOrEqual(10)
    expect(shortLines?.prompts.some((prompt) => /[A-Z]/.test(prompt) && /[.!?]/.test(prompt))).toBe(true)
    expect(grammarLines?.prompts.some((prompt) => prompt.startsWith('There is'))).toBe(true)
    expect(storyTyping?.prompts.some((prompt) => prompt.split('.').length > 2)).toBe(true)
  })

  test('adds pinyin lessons with chinese display labels', () => {
    const pinyinSounds = getLessonById('pinyin-sounds')
    const chineseWords = getLessonById('chinese-words')
    const idioms = getLessonById('idiom-pinyin')

    expect(pinyinSounds?.promptLabels?.[0]).toBe('妈妈 爸爸')
    expect(pinyinSounds?.prompts[0]).toBe('ma ma ba ba')
    expect(chineseWords?.promptLabels).toContain('电脑 键盘')
    expect(idioms?.promptLabels).toContain('熟能生巧')
  })
})
