import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme, accentColor, setAccentColor } = useTheme();

  const themes = [
    { value: 'light', label: '☀️ Светлая', color: '#f5f5f5' },
    { value: 'dark', label: '🌙 Тёмная', color: '#1a1a1a' },
    { value: 'gray', label: '⚙️ Серая', color: '#6b7280' },
    { value: 'blue', label: '💙 Синяя', color: '#3b82f6' },
  ];

  const presetColors = [
    '#646cff', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '10px' }}>
      <div>
        <h4 style={{ margin: '0 0 10px 0' }}>Тема</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {themes.map(t => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value as any)}
              style={{
                padding: '8px 12px',
                backgroundColor: theme === t.value ? accentColor : 'transparent',
                color: theme === t.value ? 'white' : 'inherit',
                border: `1px solid var(--border-color)`,
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 style={{ margin: '0 0 10px 0' }}>Акцентный цвет</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {presetColors.map(color => (
            <button
              key={color}
              onClick={() => setAccentColor(color)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: color,
                border: accentColor === color ? '2px solid white' : '1px solid var(--border-color)',
                outline: accentColor === color ? '2px solid var(--text-primary)' : 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeSwitcher;