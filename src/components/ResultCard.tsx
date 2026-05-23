import type { PracticeRecord } from '../domain/types'

type ResultCardProps = {
  result: PracticeRecord | null
  saveWarning: string
  unlockHint: string
  onRetry: () => void
}

function renderStars(stars: number): string {
  return '★'.repeat(stars) + '☆'.repeat(3 - stars)
}

export function ResultCard({ result, saveWarning, unlockHint, onRetry }: ResultCardProps) {
  if (!result) {
    return (
      <section className="result-card waiting-result">
        <div className="section-label">本关星星</div>
        <h2>先开始练习吧</h2>
        <p>完成后会看到星星、准确率和用时。</p>
        <p className="unlock-hint">{unlockHint}</p>
      </section>
    )
  }

  return (
    <section className="result-card" aria-live="polite">
      <div className="result-summary">
        <div>
          <div className="section-label">本关星星</div>
          <div className="result-title-row">
            <div className="big-stars">{renderStars(result.stars)}</div>
            <h2>{result.passed ? '闯关成功！' : '再练一次就更稳了'}</h2>
          </div>
        </div>
        <button className="secondary-button" onClick={onRetry} type="button">
          再练一次
        </button>
      </div>
      <div className="result-grid">
        <span>准确率 {result.accuracy}%</span>
        <span>小错误 {result.mistakes}</span>
        <span>用时 {Math.max(1, Math.round(result.durationMs / 1000))} 秒</span>
      </div>
      <p className="unlock-hint">{unlockHint}</p>
      {saveWarning ? <p className="warning-text">{saveWarning}</p> : null}
    </section>
  )
}
