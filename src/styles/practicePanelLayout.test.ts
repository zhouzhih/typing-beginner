import { readFileSync } from 'node:fs'

import { describe, expect, test } from 'vitest'

function getCssBlock(selector: string): string {
  const css = readFileSync('src/styles/global.css', 'utf-8')
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = css.match(new RegExp(`${escapedSelector}\\s*{(?<body>[^}]+)}`))

  return match?.groups?.body ?? ''
}

describe('practice panel layout', () => {
  test('makes the typing input the primary control and keeps live feedback compact', () => {
    const appShell = getCssBlock('.app-shell')
    const practiceCard = getCssBlock('.practice-card')
    const promptBox = getCssBlock('.prompt-box')
    const typingInput = getCssBlock('.typing-input')
    const liveFeedback = getCssBlock('.live-feedback')
    const feedbackItem = getCssBlock('.live-feedback div')
    const mainLayout = getCssBlock('.main-layout')
    const resultCard = getCssBlock('.result-card')
    const resultSummary = getCssBlock('.result-summary')
    const courseList = getCssBlock('.course-list')
    const comingSoonPanel = getCssBlock('.coming-soon-panel')

    expect(appShell).toContain('padding: 12px 20px')
    expect(practiceCard).toContain('padding: 14px')
    expect(promptBox).toContain('min-height: 100px')
    expect(typingInput).toContain('height: 70px')
    expect(typingInput).toContain('border: 4px solid')
    expect(liveFeedback).toContain('display: flex')
    expect(feedbackItem).toContain('border-radius: 999px')
    expect(mainLayout).toContain('align-items: start')
    expect(resultCard).toContain('padding: 12px')
    expect(resultSummary).toContain('display: flex')
    expect(courseList).toContain('gap: 8px')
    expect(comingSoonPanel).toContain('border-radius: 999px')
  })
})
