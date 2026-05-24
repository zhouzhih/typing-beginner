import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react'

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

function getUpdatedMistakeIndexes(
  prompt: string,
  previousInput: string,
  nextInput: string,
  existingIndexes: number[],
): number[] {
  const nextMistakeIndexes = new Set(existingIndexes)
  const inputLength = Math.min(nextInput.length, prompt.length)

  for (let index = 0; index < inputLength; index += 1) {
    const actual = nextInput[index]
    const previous = previousInput[index]

    if (actual !== previous && actual !== prompt[index]) {
      nextMistakeIndexes.add(index)
    }
  }

  return [...nextMistakeIndexes].sort((a, b) => a - b)
}

function getMistakeKeys(prompt: string, mistakeIndexes: number[]): string[] {
  return mistakeIndexes.map((index) => prompt[index]).filter(Boolean)
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

type CoinDrop = {
  id: number
  left: number
  drift: number
  delay: number
  duration: number
  size: number
  rotation: number
}

type LevelUpFlash = {
  from: number
  to: number
  id: number
}

type AudioToneOptions = {
  duration: number
  type?: OscillatorType
  volume?: number
  frequency: number
  timeOffset?: number
}

function createAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') {
    return null
  }

  const AudioContextClass =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

  if (!AudioContextClass) {
    return null
  }

  return new AudioContextClass()
}

function playTone(context: AudioContext, options: AudioToneOptions) {
  const { duration, type = 'triangle', volume = 0.03, frequency, timeOffset = 0 } = options
  const now = context.currentTime + timeOffset
  const oscillator = context.createOscillator()
  const gain = context.createGain()

  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, now)

  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.linearRampToValueAtTime(volume, now + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(now)
  oscillator.stop(now + duration)
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
  const [sessionMistakeIndexes, setSessionMistakeIndexes] = useState<number[]>([])
  const [currentCombo, setCurrentCombo] = useState(0)
  const [bestCombo, setBestCombo] = useState(0)
  const [coinDrops, setCoinDrops] = useState<CoinDrop[]>([])
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [isMusicEnabled, setIsMusicEnabled] = useState(false)
  const [saveWarning, setSaveWarning] = useState('')
  const [levelUpFlash, setLevelUpFlash] = useState<LevelUpFlash | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const musicTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

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
  const shouldReduceMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const getContext = useCallback(() => {
    const context = audioContextRef.current

    if (context) {
      void context.resume()
      return context
    }

    const nextContext = createAudioContext()

    if (nextContext) {
      audioContextRef.current = nextContext
    }

    return nextContext
  }, [])

  useEffect(() => {
    if (!levelUpFlash) {
      return
    }

    const flashId = window.setTimeout(() => {
      setLevelUpFlash(null)
    }, 1600)

    return () => window.clearTimeout(flashId)
  }, [levelUpFlash])

  const clearMusicLoop = useCallback(() => {
    if (musicTimerRef.current !== null) {
      clearInterval(musicTimerRef.current)
      musicTimerRef.current = null
    }
  }, [])

  const stopMusic = useCallback(() => {
    clearMusicLoop()
    const context = audioContextRef.current

    if (context?.state === 'running') {
      void context.suspend()
    }
  }, [clearMusicLoop])

  function playRewardSound(coinCount: number) {
    if (!audioEnabled || shouldReduceMotion) {
      return
    }

    const context = getContext()

    if (!context) {
      return
    }

    const baseNotes = [440, 554.37, 659.25, 783.99]
    const dropNoteCount = Math.min(coinCount, baseNotes.length)
    const maxCount = Math.max(1, dropNoteCount)
    const playedNotes = baseNotes.slice(0, maxCount)

    playedNotes.forEach((frequency, index) => {
      playTone(context, {
        duration: 0.22,
        frequency,
        volume: 0.05,
        timeOffset: index * 0.08,
        type: 'triangle',
      })
    })
  }

  const playMusicLoop = useCallback(() => {
    if (!audioEnabled || !isMusicEnabled || shouldReduceMotion) {
      return
    }

    const context = getContext()

    if (!context) {
      return
    }

    const melody = [392, 523.25, 587.33, 659.25, 523.25, 392]

    melody.forEach((frequency, index) => {
      playTone(context, {
        duration: 0.18,
        frequency,
        volume: 0.018,
        timeOffset: index * 0.12,
        type: 'sine',
      })
    })
  }, [audioEnabled, isMusicEnabled, shouldReduceMotion, getContext])

  const startMusic = useCallback(() => {
    if (musicTimerRef.current !== null || !audioEnabled || !isMusicEnabled) {
      return
    }

    const context = getContext()

    if (!context) {
      return
    }

    playMusicLoop()
    musicTimerRef.current = setInterval(playMusicLoop, 1900)
  }, [audioEnabled, isMusicEnabled, getContext, playMusicLoop])

  function toggleMusic() {
    setIsMusicEnabled((enabled) => !enabled)
  }

  function toggleAudio() {
    setAudioEnabled((enabled) => !enabled)
  }

  function spawnCoinDrops(coinCount: number) {
    if (!coinCount || shouldReduceMotion) {
      return
    }

    const dropCount = Math.min(12, Math.max(1, Math.ceil(coinCount / 2)))
    const nextTick = performance.now()
    const nextDrops: CoinDrop[] = Array.from({ length: dropCount }, (_, index) => ({
      id: Math.floor(nextTick) + index,
      left: Math.random() * 86 + 6,
      drift: Math.random() * 60 - 30,
      delay: Math.random() * 240 + index * 45,
      duration: 1 + Math.random() * 0.9,
      size: 0.75 + Math.random() * 0.65,
      rotation: Math.random() * 180 - 90,
    }))

    setCoinDrops((current) => [...current, ...nextDrops])
  }

  function dismissCoinDrop(dropId: number) {
    setCoinDrops((current) => current.filter((drop) => drop.id !== dropId))
  }

  function updatePracticeData(nextData: typeof practiceData) {
    const saveResult = savePracticeData(nextData)

    setPracticeData(nextData)
    setSaveWarning(saveResult.ok ? '' : '本次记录没有保存，请稍后再试。')
  }

  function startPractice() {
    setInput('')
    setResult(null)
    setSessionMistakes(0)
    setSessionMistakeIndexes([])
    setCurrentCombo(0)
    setBestCombo(0)
    setSaveWarning('')
    setActivePrompt(nextPrompt)
    setActivePromptIndex(nextPromptIndex)
    setStartedAt(new Date().toISOString())
    setIsPracticing(true)
    setCoinDrops([])

    if (isMusicEnabled) {
      startMusic()
    }
  }

  function cleanupPracticeState() {
    setInput('')
    setResult(null)
    setSessionMistakes(0)
    setSessionMistakeIndexes([])
    setCurrentCombo(0)
    setBestCombo(0)
    setSaveWarning('')
  }

  function selectLesson(lesson: Lesson) {
    setSelectedLessonId(lesson.id)
    cleanupPracticeState()
    setActivePrompt('')
    setActivePromptIndex(0)
    setIsPracticing(false)
    setCoinDrops([])
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
    const nextMascotXp = practiceData.mascotXp + reward.xp
    const nextRecords = [...practiceData.records, record]
    const nextMascotLevel = Math.max(getMascotLevel(nextRecords), getMascotLevelFromXp(nextMascotXp))

    if (nextMascotLevel > mascotLevel) {
      setLevelUpFlash({
        from: mascotLevel,
        to: nextMascotLevel,
        id: Date.now(),
      })
    }

    if (reward.coins > 0) {
      spawnCoinDrops(reward.coins)
      playRewardSound(reward.coins)
    }
    const nextData = {
      ...practiceData,
      records: nextRecords,
      lastLessonId: selectedLesson.id,
      coinBalance: practiceData.coinBalance + reward.coins,
      mascotXp: nextMascotXp,
    }

    updatePracticeData(nextData)
    setResult(record)
    setIsPracticing(false)
  }

  useEffect(() => {
    if (isMusicEnabled && audioEnabled) {
      startMusic()
    } else {
      stopMusic()
    }

    return () => {
      clearMusicLoop()
    }
  }, [audioEnabled, isMusicEnabled, startMusic, stopMusic, clearMusicLoop])

  function handleInputChange(nextInput: string) {
    const trimmedInput = nextInput.slice(0, prompt.length)
    const nextSessionMistakeIndexes = getUpdatedMistakeIndexes(
      prompt,
      input,
      trimmedInput,
      sessionMistakeIndexes,
    )
    const nextSessionMistakeKeys = getMistakeKeys(prompt, nextSessionMistakeIndexes)
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
    setSessionMistakeIndexes(nextSessionMistakeIndexes)
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
      <div
        aria-label="金币掉落特效"
        className="coin-rain-layer"
      >
        {coinDrops.map((coinDrop) => (
          <span
            className="coin-drop"
            key={coinDrop.id}
            onAnimationEnd={() => dismissCoinDrop(coinDrop.id)}
            style={
              {
                '--coin-left': `${coinDrop.left}%`,
                '--coin-drift': `${coinDrop.drift}px`,
                '--coin-delay': `${coinDrop.delay}ms`,
                '--coin-duration': `${coinDrop.duration}s`,
                '--coin-rotation': `${coinDrop.rotation}deg`,
                '--coin-size': `${coinDrop.size}rem`,
              } as CSSProperties
            }
          >
            🪙
          </span>
        ))}
      </div>
      <header className="top-bar">
        <div className="brand-mark" aria-hidden="true">
          ⌨
        </div>
        <div>
          <p className="eyebrow">每天十分钟</p>
          <h1>打字小课堂</h1>
        </div>
        <div className="top-actions">
          <button
            aria-pressed={isMusicEnabled}
            className={`music-toggle ${isMusicEnabled ? 'active' : ''}`}
            onClick={toggleMusic}
            type="button"
          >
            {isMusicEnabled ? '🎵 音乐开' : '🎵 音乐关'}
          </button>
          <button
            aria-pressed={audioEnabled}
            className={`sound-toggle ${audioEnabled ? 'active' : ''}`}
            onClick={toggleAudio}
            type="button"
          >
            {audioEnabled ? '🔊 音效开' : '🔇 音效关'}
          </button>
          <ThemeSelector
            onSelectTheme={selectTheme}
            selectedThemeId={practiceData.selectedThemeId}
          />
          <MascotPanel
            coinBalance={practiceData.coinBalance}
            customMascotImage={practiceData.customMascotImage}
            equippedRewardIds={practiceData.equippedRewardIds}
            levelUpFlash={levelUpFlash}
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
            mistakeIndexes={sessionMistakeIndexes}
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
