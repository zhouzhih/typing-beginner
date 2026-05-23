import { getPracticeStreak, getRecentRecords } from '../domain/progress'
import type { PracticeRecord } from '../domain/types'

type ProgressSummaryProps = {
  records: PracticeRecord[]
}

function renderStars(stars: number): string {
  return '★'.repeat(stars) + '☆'.repeat(3 - stars)
}

export function ProgressSummary({ records }: ProgressSummaryProps) {
  const streak = getPracticeStreak(records)
  const recentRecords = getRecentRecords(records, 2)
  const todayKey = new Date().toISOString().slice(0, 10)
  const todayCount = records.filter((record) => record.completedAt.slice(0, 10) === todayKey).length

  return (
    <aside className="progress-column">
      <section className="side-card progress-card">
        <div className="section-label">我的小进步</div>
        <h2>今天练了 {todayCount} 次</h2>
        <div className="progress-track" aria-label="今日进度">
          <div className="progress-fill" style={{ width: `${Math.min(todayCount * 34, 100)}%` }} />
        </div>
        <p>连续练习 {streak} 天</p>
      </section>

      <section className="side-card recent-card">
        <div className="section-label">最近练习</div>
        <h2>星星记录</h2>
        {recentRecords.length > 0 ? (
          <ul className="recent-list">
            {recentRecords.map((record) => (
              <li key={record.id}>
                <span>{new Date(record.completedAt).toLocaleDateString('zh-CN')}</span>
                <strong>{renderStars(record.stars)}</strong>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-note">完成一次练习后，这里会出现星星。</p>
        )}
      </section>
    </aside>
  )
}
