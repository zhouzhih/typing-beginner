import { getPracticeStreak, getRecentRecords } from '../domain/progress'
import { buildDailyTasks } from '../domain/gamification'
import { getMascotLevelFromXp, getNextMascotLevelXp } from '../domain/mascot'
import type { PracticeRecord } from '../domain/types'

type ProgressSummaryProps = {
  records: PracticeRecord[]
  coinBalance: number
  mascotXp: number
}

function renderStars(stars: number): string {
  return '★'.repeat(stars) + '☆'.repeat(3 - stars)
}

export function ProgressSummary({ records, coinBalance, mascotXp }: ProgressSummaryProps) {
  const streak = getPracticeStreak(records)
  const recentRecords = getRecentRecords(records, 2)
  const todayKey = new Date().toISOString().slice(0, 10)
  const todayCount = records.filter((record) => record.completedAt.slice(0, 10) === todayKey).length
  const mascotLevel = getMascotLevelFromXp(mascotXp)
  const nextLevelXp = getNextMascotLevelXp(mascotXp)
  const dailyTasks = buildDailyTasks(records)

  return (
    <aside className="progress-column">
      <section className="side-card progress-card">
        <div className="section-label">我的小进步</div>
        <h2>今天练了 {todayCount} 次</h2>
        <div className="wallet-row">
          <span>金币 {coinBalance}</span>
          <span>伙伴 Lv.{mascotLevel}</span>
        </div>
        <div className="progress-track" aria-label="今日进度">
          <div className="progress-fill" style={{ width: `${Math.min(todayCount * 34, 100)}%` }} />
        </div>
        <p>连续练习 {streak} 天</p>
        <p className="xp-note">
          经验 {mascotXp} / {nextLevelXp}
        </p>
      </section>

      <section className="side-card daily-task-card">
        <div className="section-label">今日小任务</div>
        <h2>做完有成就</h2>
        <ul className="daily-task-list" aria-label="今日小任务">
          {dailyTasks.map((task) => (
            <li className={task.isComplete ? 'complete' : ''} key={task.id}>
              <span>{task.title}</span>
              <strong>
                {Math.min(task.progress, task.target)} / {task.target}
              </strong>
            </li>
          ))}
        </ul>
      </section>

      <section className="side-card recent-card">
        <div className="section-label">最近练习</div>
        <h2>星星记录</h2>
        {recentRecords.length > 0 ? (
          <ul className="recent-list" aria-label="星星记录">
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
