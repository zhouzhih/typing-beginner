import type { Course, Lesson } from '../domain/types'

export const courses: Course[] = [
  {
    id: 'english-foundation',
    title: '英文基础',
    description: '从手指的家开始，慢慢认识字母、单词和短句。',
    status: 'active',
    lessons: [
      {
        id: 'home-row',
        title: '手指的家',
        level: 1,
        kind: 'characters',
        prompts: ['asdf jkl;', 'aa ss dd ff', 'jj kk ll ;;'],
      },
      {
        id: 'letter-friends',
        title: '字母朋友',
        level: 2,
        kind: 'characters',
        prompts: ['asdf ghjk', 'qwer uiop', 'zxcv bnm'],
        unlockAfter: 'home-row',
      },
      {
        id: 'tiny-words',
        title: '小单词',
        level: 3,
        kind: 'words',
        prompts: ['dad sad ask', 'kid jam fun', 'sun map red'],
        unlockAfter: 'letter-friends',
      },
      {
        id: 'short-lines',
        title: '小短句',
        level: 4,
        kind: 'sentences',
        prompts: ['a kid can type', 'dad has a map', 'fun words are easy'],
        unlockAfter: 'tiny-words',
      },
    ],
  },
  {
    id: 'pinyin-starter',
    title: '中文拼音',
    description: '拼音课程即将开放。',
    status: 'coming-soon',
    lessons: [],
  },
]

export function getAllLessons(): Lesson[] {
  return courses.flatMap((course) => course.lessons)
}

export function getLessonById(lessonId: string): Lesson | undefined {
  return getAllLessons().find((lesson) => lesson.id === lessonId)
}
