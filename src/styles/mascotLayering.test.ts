import { readFileSync } from 'node:fs'

import { describe, expect, test } from 'vitest'

describe('mascot dialog layering', () => {
  test('keeps the close button above the animated mascot image', () => {
    const css = readFileSync('src/styles/global.css', 'utf-8')
    const closeBlock = css.match(/\.mascot-close\s*{(?<body>[^}]+)}/)?.groups?.body ?? ''

    expect(closeBlock).toContain('z-index')
  })
})
