export type CharacterStatus = 'correct' | 'incorrect' | 'current' | 'pending'

export type EvaluatedCharacter = {
  expected: string
  actual: string
  status: CharacterStatus
}

export type PracticeEvaluation = {
  target: string
  input: string
  characters: EvaluatedCharacter[]
  mistakes: number
  isComplete: boolean
}

export type LessonKind = 'characters' | 'words' | 'sentences' | 'pinyin'

export type Lesson = {
  id: string
  title: string
  level: number
  kind: LessonKind
  prompts: string[]
  unlockAfter?: string
}

export type Course = {
  id: string
  title: string
  description: string
  status: 'active' | 'coming-soon'
  lessons: Lesson[]
}

export type PracticeRecord = {
  id: string
  lessonId: string
  prompt: string
  startedAt: string
  completedAt: string
  durationMs: number
  totalChars: number
  mistakes: number
  accuracy: number
  stars: 1 | 2 | 3
  passed: boolean
}
