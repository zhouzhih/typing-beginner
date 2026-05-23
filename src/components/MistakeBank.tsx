import { getFrequentMistakeKeys } from '../domain/mistakes'
import type { PracticeRecord } from '../domain/types'

type MistakeBankProps = {
  records: PracticeRecord[]
}

function formatMistakeKey(key: string): string {
  return key === ' ' ? '空格' : key
}

export function MistakeBank({ records }: MistakeBankProps) {
  const frequentKeys = getFrequentMistakeKeys(records, 5)

  return (
    <section className="side-card mistake-bank-card" aria-labelledby="mistake-bank-title">
      <div className="section-label">错题库</div>
      <h2 id="mistake-bank-title">错题小本</h2>
      {frequentKeys.length > 0 ? (
        <ul className="mistake-key-list">
          {frequentKeys.map((item) => (
            <li key={item.key}>
              <span>{formatMistakeKey(item.key)}</span>
              <strong>{item.count} 次</strong>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-note">还没有常错键，继续保持。</p>
      )}
    </section>
  )
}
