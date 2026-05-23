import { useMemo, useState } from 'react'

import { CourseMap } from '../components/CourseMap'
import { MascotPanel } from '../components/MascotPanel'
import { PracticePanel } from '../components/PracticePanel'
import { ProgressSummary } from '../components/ProgressSummary'
import { ResultCard } from '../components/ResultCard'
import { ThemeSelector } from '../components/ThemeSelector'
import { courses, getAllLessons, getLessonById } from '../data/courses'
import { getMascotLevel, getUnlockedRewards, type MascotId } from '../domain/mascot'
import { evaluatePractice } from '../domain/practiceEngine'
import { getRequiredPasses } from '../domain/progress'
import { calculateAccuracy, calculateDurationMs, calculateStars, isPassed } from '../domain/stats'
import type { ThemeId } from '../domain/theme'
import type { Lesson, PracticeRecord } from '../domain/types'
import { loadPracticeData, savePracticeData } from '../storage/practiceStorage'

function createRecordId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `record-${Date.now()}`
}

function getPromptForLesson(lesson: Lesson, completedCount: number): string {
  return lesson.prompts[completedCount % lesson.prompts.length] ?? ''
}

function getInitialLessonId(savedLessonId: string): string {
  const savedLesson = getLessonById(savedLessonId)
  const firstLesson = getAllLessons()[0]

  if (!firstLesson) {
    return savedLessonId
  }

  if (!savedLesson) {
    return firstLesson.id
  }

  return savedLesson.id
}

function getUnlockHint(lesson: Lesson, records: PracticeRecord[]): string {
  const nextLesson = getAllLessons().find((candidate) => candidate.unlockAfter === lesson.id)

  if (!nextLesson) {
    return '这一组课程已经完成，可以继续复习拿满星。'
  }

  const passedCount = records.filter((record) => record.lessonId === lesson.id && record.passed).length
  const remaining = Math.max(0, getRequiredPasses(lesson) - passedCount)

  if (remaining === 0) {
    return `「${nextLesson.title}」已解锁，可以挑战下一关了。`
  }

  return `再通过 ${remaining} 次，就能解锁「${nextLesson.title}」`
}

function countAddedMistakes(prompt: string, previousInput: string, nextInput: string): number {
  return Array.from(nextInput).filter((actual, index) => {
    const previous = previousInput[index]

    return actual !== previous && actual !== prompt[index]
  }).length
}

export default function App() {
  const [practiceData, setPracticeData] = useState(() => loadPracticeData())
  const [selectedLessonId, setSelectedLessonId] = useState(() =>
    getInitialLessonId(practiceData.lastLessonId),
  )
  const [isPracticing, setIsPracticing] = useState(false)
  const [input, setInput] = useState('')
  const [startedAt, setStartedAt] = useState('')
  const [activePrompt, setActivePrompt] = useState('')
  const [activePromptIndex, setActivePromptIndex] = useState(0)
  const [result, setResult] = useState<PracticeRecord | null>(null)
  const [sessionMistakes, setSessionMistakes] = useState(0)
  const [saveWarning, setSaveWarning] = useState('')

  const selectedLesson = getLessonById(selectedLessonId) ?? getAllLessons()[0]
  const completedCount = practiceData.records.filter(
    (record) => record.lessonId === selectedLesson.id,
  ).length
  const nextPrompt = useMemo(
    () => getPromptForLesson(selectedLesson, completedCount),
    [completedCount, selectedLesson],
  )
  const nextPromptIndex = (completedCount % selectedLesson.prompts.length) + 1
  const prompt = activePrompt || nextPrompt
  const promptIndex = activePromptIndex || nextPromptIndex
  const evaluation = evaluatePractice(prompt, input)
  const unlockHint = getUnlockHint(selectedLesson, practiceData.records)
  const mascotLevel = getMascotLevel(practiceData.records)
  const unlockedRewards = getUnlockedRewards(practiceData.records)

  function updatePracticeData(nextData: typeof practiceData) {
    const saveResult = savePracticeData(nextData)

    setPracticeData(nextData)
    setSaveWarning(saveResult.ok ? '' : '本次记录没有保存，请稍后再试。')
  }

  function startPractice() {
    setInput('')
    setResult(null)
    setSessionMistakes(0)
    setSaveWarning('')
    setActivePrompt(nextPrompt)
    setActivePromptIndex(nextPromptIndex)
    setStartedAt(new Date().toISOString())
    setIsPracticing(true)
  }

  function selectLesson(lesson: Lesson) {
    setSelectedLessonId(lesson.id)
    setInput('')
    setResult(null)
    setSessionMistakes(0)
    setSaveWarning('')
    setActivePrompt('')
    setActivePromptIndex(0)
    setIsPracticing(false)
  }

  function completePractice(nextInput: string, mistakeCount: number) {
    const completedAt = new Date().toISOString()
    const nextEvaluation = evaluatePractice(prompt, nextInput)
    const accuracy = calculateAccuracy(prompt.length, mistakeCount)
    const record: PracticeRecord = {
      id: createRecordId(),
      lessonId: selectedLesson.id,
      prompt,
      startedAt: startedAt || completedAt,
      completedAt,
      durationMs: calculateDurationMs(startedAt || completedAt, completedAt),
      totalChars: prompt.length,
      mistakes: mistakeCount,
      accuracy,
      stars: calculateStars(accuracy),
      passed: isPassed(accuracy, nextEvaluation.isComplete),
    }
    const nextData = {
      ...practiceData,
      records: [...practiceData.records, record],
      lastLessonId: selectedLesson.id,
    }

    updatePracticeData(nextData)
    setResult(record)
    setIsPracticing(false)
  }

  function handleInputChange(nextInput: string) {
    const trimmedInput = nextInput.slice(0, prompt.length)
    const nextSessionMistakes =
      sessionMistakes + countAddedMistakes(prompt, input, trimmedInput)

    setInput(trimmedInput)
    setSessionMistakes(nextSessionMistakes)

    if (trimmedInput.length >= prompt.length) {
      completePractice(trimmedInput, nextSessionMistakes)
    }
  }

  function selectMascot(selectedMascotId: MascotId) {
    updatePracticeData({ ...practiceData, selectedMascotId })
  }

  function uploadCustomMascot(customMascotImage: string) {
    updatePracticeData({ ...practiceData, customMascotImage, selectedMascotId: 'custom' })
  }

  function selectTheme(selectedThemeId: ThemeId) {
    updatePracticeData({ ...practiceData, selectedThemeId })
  }

  return (
    <div className={`app-shell theme-${practiceData.selectedThemeId}`}>
      <header className="top-bar">
        <div className="brand-mark" aria-hidden="true">
          ⌨
        </div>
        <div>
          <p className="eyebrow">每天十分钟</p>
          <h1>打字小课堂</h1>
        </div>
        <div className="top-actions">
          <ThemeSelector
            onSelectTheme={selectTheme}
            selectedThemeId={practiceData.selectedThemeId}
          />
          <MascotPanel
            customMascotImage={practiceData.customMascotImage}
            level={mascotLevel}
            onSelectMascot={selectMascot}
            onUploadCustomMascot={uploadCustomMascot}
            rewards={unlockedRewards}
            selectedMascotId={practiceData.selectedMascotId}
          />
        </div>
      </header>

      <div className="main-layout">
        <section className="left-column">
          <PracticePanel
            evaluation={evaluation}
            input={input}
            isPracticing={isPracticing}
            lesson={selectedLesson}
            mistakeCount={sessionMistakes}
            onInputChange={handleInputChange}
            onStart={startPractice}
            promptIndex={promptIndex}
            promptTotal={selectedLesson.prompts.length}
            prompt={prompt}
          />
          <ResultCard
            result={result}
            saveWarning={saveWarning}
            unlockHint={unlockHint}
            onRetry={startPractice}
          />
        </section>

        <div className="right-column">
          <ProgressSummary records={practiceData.records} />
          <CourseMap
            courses={courses}
            onSelectLesson={selectLesson}
            records={practiceData.records}
            selectedLessonId={selectedLesson.id}
          />
        </div>
      </div>
    </div>
  )
}
