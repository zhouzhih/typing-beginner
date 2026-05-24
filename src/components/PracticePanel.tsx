import { useEffect, useRef, type ChangeEvent } from 'react'

import type { Lesson, PracticeEvaluation } from '../domain/types'

type PracticePanelProps = {
  lesson: Lesson
  prompt: string
  promptLabel: string
  input: string
  evaluation: PracticeEvaluation
  isPracticing: boolean
  mistakeCount: number
  currentCombo: number
  bestCombo: number
  promptIndex: number
  promptTotal: number
  onStart: () => void
  onInputChange: (value: string) => void
}

export function PracticePanel({
  lesson,
  prompt,
  promptLabel,
  input,
  evaluation,
  isPracticing,
  mistakeCount,
  currentCombo,
  bestCombo,
  promptIndex,
  promptTotal,
  onStart,
  onInputChange,
}: PracticePanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isPracticing) {
      inputRef.current?.focus({ preventScroll: true })
    }
  }, [isPracticing, prompt])

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    onInputChange(event.target.value)
  }

  return (
    <main className="practice-card">
      <div className="practice-header">
        <div>
          <div className="section-label">今日任务</div>
          <h2>{lesson.title}</h2>
          <p>{isPracticing ? '跟着彩色小火车输入' : lesson.studyTip || '准备好就开始今天的练习'}</p>
          <p className="prompt-meta">
            第 {promptIndex} / {promptTotal} 题
          </p>
        </div>
        <button className="start-button" onClick={onStart} type="button">
          {isPracticing ? '重新开始' : '开始'}
        </button>
      </div>

      <div className="prompt-box" aria-label="练习内容">
        {promptLabel ? <div className="prompt-label">{promptLabel}</div> : null}
        {evaluation.characters.map((character, index) => (
          <span className={`prompt-char ${character.status}`} key={`${character.expected}-${index}`}>
            {character.expected === ' ' ? '\u00A0' : character.expected}
          </span>
        ))}
      </div>

      <label className="typing-label" htmlFor="typing-input">
        打字输入框
      </label>
      <input
        aria-label="打字输入框"
        autoComplete="off"
        className="typing-input"
        disabled={!isPracticing}
        id="typing-input"
        maxLength={prompt.length}
        onChange={handleInputChange}
        placeholder={isPracticing ? '在这里打字' : '点击开始后输入'}
        ref={inputRef}
        spellCheck={false}
        value={input}
      />

      <div className="live-feedback" aria-live="polite">
        <div>
          <span>当前表现</span>
          <strong>{evaluation.mistakes === 0 ? '很棒！' : '再试一次'}</strong>
        </div>
        <div className={currentCombo >= 5 ? 'combo-hot' : ''}>
          <span>连对</span>
          <strong>{currentCombo}</strong>
        </div>
        <div>
          <span>小错误</span>
          <strong>{mistakeCount}</strong>
        </div>
        <div>
          <span>最好</span>
          <strong>{bestCombo}</strong>
        </div>
      </div>
    </main>
  )
}
