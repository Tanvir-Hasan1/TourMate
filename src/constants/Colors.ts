const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    card: '#f8f9fa',
    border: '#e9ecef',
    subtext: '#6c757d',
    primary: '#007AFF',
    secondary: '#5856D6',
    success: '#34C759',
    danger: '#FF3B30',
    warning: '#FF9500',
    info: '#5AC8FA',
    shadow: '#000',
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
    card: '#1c1c1e',
    border: '#38383a',
    subtext: '#8e8e93',
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    success: '#30D158',
    danger: '#FF453A',
    warning: '#FF9F0A',
    info: '#64D2FF',
    shadow: '#fff',
  },
};

export const CategoryColors: Record<string, string> = {
  Food: '#FF9500',
  Transport: '#5AC8FA',
  Hotel: '#5856D6',
  Tickets: '#FF2D55',
  Shopping: '#AF52DE',
  Other: '#8E8E93',
};
