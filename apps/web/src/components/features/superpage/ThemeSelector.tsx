import { ThemeSelectorProps } from './types';

export function ThemeSelector({ 
  activeThemeId, 
  themeOptions,
  onThemeChange 
}: ThemeSelectorProps) {
  return (
    <div>
      <h2 className="text-sm font-medium text-slate-900 mb-3">Theme</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {themeOptions.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onThemeChange(theme.id)}
            className={`flex flex-col items-center p-3 border rounded-md ${
              activeThemeId === theme.id
                ? `border-2 ${theme.accentClass} bg-white`
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className={`w-full h-8 rounded-md mb-2 ${theme.buttonClass}`} />
            <span className="text-xs font-medium">{theme.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
} 