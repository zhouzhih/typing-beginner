import { themes, type ThemeId } from '../domain/theme'

type ThemeSelectorProps = {
  selectedThemeId: ThemeId
  onSelectTheme: (themeId: ThemeId) => void
}

export function ThemeSelector({ selectedThemeId, onSelectTheme }: ThemeSelectorProps) {
  return (
    <div className="theme-selector" role="group" aria-label="页面风格">
      {themes.map((theme) => (
        <button
          aria-pressed={selectedThemeId === theme.id}
          key={theme.id}
          onClick={() => onSelectTheme(theme.id)}
          type="button"
        >
          <span aria-hidden="true">{theme.icon}</span>
          {theme.title}
        </button>
      ))}
    </div>
  )
}
