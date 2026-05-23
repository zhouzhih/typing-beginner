import type { CharacterStatus, PracticeEvaluation } from './types'

function getCharacterStatus(target: string, input: string, index: number): CharacterStatus {
  const actual = input[index]

  if (actual === undefined) {
    return index === input.length ? 'current' : 'pending'
  }

  return actual === target[index] ? 'correct' : 'incorrect'
}

export function evaluatePractice(target: string, input: string): PracticeEvaluation {
  const characters = Array.from(target).map((expected, index) => {
    const actual = input[index] ?? ''
    const status = getCharacterStatus(target, input, index)

    return { expected, actual, status }
  })

  return {
    target,
    input,
    characters,
    mistakes: characters.filter((character) => character.status === 'incorrect').length,
    isComplete: input.length >= target.length,
  }
}
