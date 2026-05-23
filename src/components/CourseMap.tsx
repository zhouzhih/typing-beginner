import { isLessonUnlocked } from '../domain/progress'
import type { Course, Lesson, PracticeRecord } from '../domain/types'

type CourseMapProps = {
  courses: Course[]
  records: PracticeRecord[]
  selectedLessonId: string
  onSelectLesson: (lesson: Lesson) => void
}

export function CourseMap({
  courses,
  records,
  selectedLessonId,
  onSelectLesson,
}: CourseMapProps) {
  return (
    <section className="side-card course-map" aria-labelledby="course-map-heading">
      <div className="section-label">课程地图</div>
      <h2 id="course-map-heading">一关一关慢慢来</h2>

      <div className="course-list">
        {courses.map((course) => (
          <div className="course-group" key={course.id}>
            <div className="course-title">
              <span>{course.title}</span>
              {course.status === 'coming-soon' ? <em>即将开放</em> : null}
            </div>

            {course.lessons.length > 0 ? (
              <div className="lesson-list">
                {course.lessons.map((lesson) => {
                  const unlocked = isLessonUnlocked(lesson, records)
                  const selected = lesson.id === selectedLessonId

                  return (
                    <button
                      className={`lesson-button ${selected ? 'selected' : ''}`}
                      disabled={!unlocked}
                      key={lesson.id}
                      onClick={() => onSelectLesson(lesson)}
                      type="button"
                    >
                      <span className="lesson-badge">{lesson.level}</span>
                      <span>{lesson.title}</span>
                      <small>{unlocked ? '可练习' : '再加油'}</small>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="coming-soon-panel">先练好英文基础，再来挑战拼音。</div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
