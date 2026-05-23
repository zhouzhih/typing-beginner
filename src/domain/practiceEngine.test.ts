import { describe, expect, test } from 'vitest'

import { evaluatePractice } from './practiceEngine'

describe('evaluatePractice', () => {
  test('marks typed characters and current character for partial input', () => {
    const result = evaluatePractice('asdf', 'as')

    expect(result.isComplete).toBe(false)
    expect(result.mistakes).toBe(0)
    expect(result.characters.map((character) => character.status)).toEqual([
      'correct',
      'correct',
      'current',
      'pending',
    ])
  })

  test('marks mismatched input as incorrect', () => {
    const result = evaluatePractice('asdf', 'axdf')

    expect(result.isComplete).toBe(true)
    expect(result.mistakes).toBe(1)
    expect(result.characters.map((character) => character.status)).toEqual([
      'correct',
      'incorrect',
      'correct',
      'correct',
    ])
  })

  test('marks matching full input as complete', () => {
    const result = evaluatePractice('as', 'as')

    expect(result.isComplete).toBe(true)
    expect(result.mistakes).toBe(0)
    expect(result.characters.every((character) => character.status === 'correct')).toBe(true)
  })
})
