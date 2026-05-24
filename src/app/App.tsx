import { useMemo, useState } from 'react'

import { CourseMap } from '../components/CourseMap'
import { KeyboardTips } from '../components/KeyboardTips'
import { MascotPanel } from '../components/MascotPanel'
import { MistakeBank } from '../components/MistakeBank'
import { PracticePanel } from '../components/PracticePanel'
import { ProgressSummary } from '../components/ProgressSummary'
import { ResultCard } from '../components/ResultCard'
import { ThemeSelector } from '../components/ThemeSelector'
import { courses, getAllLessons, getLessonById } from '../data/courses'
import {
  getMascotLevel,
  getMascotLevelFromXp,
  rewards,
  type MascotId,
  type RewardId,
} from '../domain/mascot'
import { calculatePracticeReward } from '../domain/gamification'
import { evaluatePractice } from '../domain/practiceEngine'
import { getRequiredPasses } from '../domain/progress'
import { buildPracticeReportCsv } from '../domain/report'
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

function getPromptLabelForLesson(lesson: Lesson, completedCount: number): string {
  return lesson.promptLabels?.[completedCount % lesson.prompts.length] ?? ''
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

function getAddedMistakeKeys(prompt: string, previousInput: string, nextInput: string): string[] {
  return Array.from(nextInput).flatMap((actual, index) => {
    const previous = previousInput[index]

    return actual !== previous && actual !== prompt[index] ? [prompt[index]] : []
  })
}

function downloadTextFile(fileName: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = fileName
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
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
  const [sessionMistakeKeys, setSessionMistakeKeys] = useState<string[]>([])
  const [currentCombo, setCurrentCombo] = useState(0)
  const [bestCombo, setBestCombo] = useState(0)
  const [saveWarning, setSaveWarning] = useState('')

  const selectedLesson = getLessonById(selectedLessonId) ?? getAllLessons()[0]
  const completedCount = practiceData.records.filter(
    (record) => record.lessonId === selectedLesson.id,
  ).length
  const nextPrompt = useMemo(
    () => getPromptForLesson(selectedLesson, completedCount),
    [completedCount, selectedLesson],
  )
  const nextPromptLabel = useMemo(
    () => getPromptLabelForLesson(selectedLesson, completedCount),
    [completedCount, selectedLesson],
  )
  const nextPromptIndex = (completedCount % selectedLesson.prompts.length) + 1
  const prompt = activePrompt || nextPrompt
  const promptLabel = activePrompt
    ? getPromptLabelForLesson(selectedLesson, activePromptIndex - 1)
    : nextPromptLabel
  const promptIndex = activePromptIndex || nextPromptIndex
  const evaluation = evaluatePractice(prompt, input)
  const unlockHint = getUnlockHint(selectedLesson, practiceData.records)
  const mascotLevel = Math.max(
    getMascotLevel(practiceData.records),
    getMascotLevelFromXp(practiceData.mascotXp),
  )

  function updatePracticeData(nextData: typeof practiceData) {
    const saveResult = savePracticeData(nextData)

    setPracticeData(nextData)
    setSaveWarning(saveResult.ok ? '' : '本次记录没有保存，请稍后再试。')
  }

  function startPractice() {
    setInput('')
    setResult(null)
    setSessionMistakes(0)
    setSessionMistakeKeys([])
    setCurrentCombo(0)
    setBestCombo(0)
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
    setSessionMistakeKeys([])
    setCurrentCombo(0)
    setBestCombo(0)
    setSaveWarning('')
    setActivePrompt('')
    setActivePromptIndex(0)
    setIsPracticing(false)
  }

  function completePractice(
    nextInput: string,
    mistakeCount: number,
    mistakeKeys: string[],
    completedBestCombo: number,
  ) {
    const completedAt = new Date().toISOString()
    const nextEvaluation = evaluatePractice(prompt, nextInput)
    const accuracy = calculateAccuracy(prompt.length, mistakeCount)
    const baseRecord: PracticeRecord = {
      id: createRecordId(),
      lessonId: selectedLesson.id,
      prompt,
      startedAt: startedAt || completedAt,
      completedAt,
      durationMs: calculateDurationMs(startedAt || completedAt, completedAt),
      totalChars: prompt.length,
      mistakes: mistakeCount,
      mistakeKeys,
      accuracy,
      stars: calculateStars(accuracy),
      passed: isPassed(accuracy, nextEvaluation.isComplete),
      bestCombo: completedBestCombo,
    }
    const reward = calculatePracticeReward(baseRecord, practiceData.records, new Date(completedAt))
    const record: PracticeRecord = {
      ...baseRecord,
      coinsEarned: reward.coins,
      xpEarned: reward.xp,
    }
    const nextData = {
      ...practiceData,
      records: [...practiceData.records, record],
      lastLessonId: selectedLesson.id,
      coinBalance: practiceData.coinBalance + reward.coins,
      mascotXp: practiceData.mascotXp + reward.xp,
    }

    updatePracticeData(nextData)
    setResult(record)
    setIsPracticing(false)
  }

  function handleInputChange(nextInput: string) {
    const trimmedInput = nextInput.slice(0, prompt.length)
    const addedMistakeKeys = getAddedMistakeKeys(prompt, input, trimmedInput)
    const nextSessionMistakeKeys = [...sessionMistakeKeys, ...addedMistakeKeys]
    const nextSessionMistakes = nextSessionMistakeKeys.length
    let nextCurrentCombo = currentCombo
    let nextBestCombo = bestCombo

    if (trimmedInput.length > input.length) {
      for (let index = input.length; index < trimmedInput.length; index += 1) {
        if (trimmedInput[index] === prompt[index]) {
          nextCurrentCombo += 1
        } else {
          nextCurrentCombo = 0
        }

        nextBestCombo = Math.max(nextBestCombo, nextCurrentCombo)
      }
    }

    setInput(trimmedInput)
    setSessionMistakes(nextSessionMistakes)
    setSessionMistakeKeys(nextSessionMistakeKeys)
    setCurrentCombo(nextCurrentCombo)
    setBestCombo(nextBestCombo)

    if (trimmedInput.length >= prompt.length) {
      completePractice(trimmedInput, nextSessionMistakes, nextSessionMistakeKeys, nextBestCombo)
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

  function buyReward(rewardId: RewardId) {
    const reward = rewards.find((candidate) => candidate.id === rewardId)

    if (
      !reward ||
      practiceData.ownedRewardIds.includes(rewardId) ||
      reward.unlockLevel > mascotLevel ||
      practiceData.coinBalance < reward.cost
    ) {
      return
    }

    updatePracticeData({
      ...practiceData,
      coinBalance: practiceData.coinBalance - reward.cost,
      ownedRewardIds: [...practiceData.ownedRewardIds, rewardId],
      equippedRewardIds: [...practiceData.equippedRewardIds, rewardId],
    })
  }

  function toggleReward(rewardId: RewardId) {
    if (!practiceData.ownedRewardIds.includes(rewardId)) {
      return
    }

    const isEquipped = practiceData.equippedRewardIds.includes(rewardId)

    updatePracticeData({
      ...practiceData,
      equippedRewardIds: isEquipped
        ? practiceData.equippedRewardIds.filter((item) => item !== rewardId)
        : [...practiceData.equippedRewardIds, rewardId],
    })
  }

  function exportResults() {
    const csv = buildPracticeReportCsv(practiceData.records, getAllLessons())
    const today = new Date().toISOString().slice(0, 10)

    downloadTextFile(`typing-report-${today}.csv`, csv, 'text/csv;charset=utf-8')
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
            coinBalance={practiceData.coinBalance}
            customMascotImage={practiceData.customMascotImage}
            equippedRewardIds={practiceData.equippedRewardIds}
            level={mascotLevel}
            onBuyReward={buyReward}
            onSelectMascot={selectMascot}
            onToggleReward={toggleReward}
            onUploadCustomMascot={uploadCustomMascot}
            ownedRewardIds={practiceData.ownedRewardIds}
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
            currentCombo={currentCombo}
            bestCombo={bestCombo}
            onInputChange={handleInputChange}
            onStart={startPractice}
            promptIndex={promptIndex}
            promptTotal={selectedLesson.prompts.length}
            prompt={prompt}
            promptLabel={promptLabel}
          />
          <ResultCard
            result={result}
            saveWarning={saveWarning}
            unlockHint={unlockHint}
            onExportResults={exportResults}
            onRetry={startPractice}
          />
        </section>

        <div className="right-column">
          <ProgressSummary
            coinBalance={practiceData.coinBalance}
            mascotXp={practiceData.mascotXp}
            records={practiceData.records}
          />
          <CourseMap
            courses={courses}
            onSelectLesson={selectLesson}
            records={practiceData.records}
            selectedLessonId={selectedLesson.id}
          />
          <MistakeBank records={practiceData.records} />
          <KeyboardTips />
        </div>
      </div>
    </div>
  )
}
