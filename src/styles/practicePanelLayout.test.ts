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
    const typingInput = getCssBlock('.typing-input')
    const liveFeedback = getCssBlock('.live-feedback')
    const feedbackItem = getCssBlock('.live-feedback div')
    const mainLayout = getCssBlock('.main-layout')

    expect(typingInput).toContain('height: 76px')
    expect(typingInput).toContain('border: 4px solid')
    expect(liveFeedback).toContain('display: flex')
    expect(feedbackItem).toContain('border-radius: 999px')
    expect(mainLayout).toContain('align-items: start')
  })
})
