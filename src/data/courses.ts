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
        requiredPasses: 2,
        prompts: ['asdf jkl;', 'aa ss dd ff', 'jj kk ll ;;'],
      },
      {
        id: 'letter-friends',
        title: '字母朋友',
        level: 2,
        kind: 'characters',
        requiredPasses: 4,
        prompts: [
          'asdf ghjk asdf ghjk',
          'qwer uiop qwer uiop',
          'zxcv bnm zxcv bnm',
          'aq sw de fr aq sw de fr',
          'ju ki lo p; ju ki lo p;',
          'az sx dc fv gb hn jm',
          'qaz wsx edc rfv tgb yhn',
          'ujm ikn olb p; qwer uiop',
          'a q z s w x e d c r f v t g b',
          'j u m k i n l o p h y b ; g t v',
          'red blue green yellow',
          'home row top row bottom row',
        ],
        unlockAfter: 'home-row',
      },
      {
        id: 'tiny-words',
        title: '小单词',
        level: 3,
        kind: 'words',
        requiredPasses: 5,
        prompts: [
          'dad sad ask',
          'kid jam fun',
          'sun map red',
          'bed pen cup',
          'run jump skip',
          'cat dog fish',
          'book desk hand',
          'milk cake rice',
          'good nice happy',
          'green yellow blue',
          'school pencil bag',
          'friend teacher class',
        ],
        unlockAfter: 'letter-friends',
      },
      {
        id: 'short-lines',
        title: '小短句',
        level: 4,
        kind: 'sentences',
        requiredPasses: 6,
        prompts: [
          'a kid can type',
          'dad has a map',
          'fun words are easy',
          'I can type fast.',
          'The sun is warm.',
          'We read a book.',
          'My hands stay home.',
          'Good typing is calm.',
          'I fix one mistake.',
          'Can you type this?',
          'Small steps win.',
          'Practice makes progress.',
        ],
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
