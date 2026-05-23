export type ThemeId = 'meadow' | 'sky' | 'space'

export type Theme = {
  id: ThemeId
  title: string
  icon: string
}

export const themes: Theme[] = [
  { id: 'meadow', title: '青草绿', icon: '🌿' },
  { id: 'sky', title: '天空蓝', icon: '☁' },
  { id: 'space', title: '星空夜', icon: '★' },
]

export function getThemeById(themeId: string | undefined): Theme {
  return themes.find((theme) => theme.id === themeId) ?? themes[0]
}
