import { Platform } from 'react-native';

export const Theme = {
  colors: {
    primary: '#2563EB',
    sidebar: '#1E3A8A',
    background: '#F5F9FF',
    cardBackground: 'rgba(255, 255, 255, 0.65)',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    border: 'rgba(255, 255, 255, 0.30)',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B',
    lightBlue: 'rgba(59, 130, 246, 0.10)',
    lightSuccess: 'rgba(16, 185, 129, 0.10)',
    lightWarning: 'rgba(245, 158, 11, 0.10)',
    lightDanger: 'rgba(239, 68, 68, 0.10)',
    sidebarActive: 'rgba(255, 255, 255, 0.16)',
    sidebarHover: 'rgba(255, 255, 255, 0.08)',
    headerBg: 'rgba(255, 255, 255, 0.70)',
    chatBg: '#ECE5DD',
    chatPattern: '#F0F2F5',
    // Luxury tints
    cardProperty: 'rgba(59, 130, 246, 0.10)',
    cardAnalytics: 'rgba(37, 99, 235, 0.12)',
    cardTrust: 'rgba(99, 102, 241, 0.12)',
    cardVerification: 'rgba(59, 130, 246, 0.15)',
    cardStatistics: 'rgba(37, 99, 235, 0.10)',
  },
  radius: {
    xs: 6,
    small: 8,
    medium: 12,
    large: 16,
    xl: 20,
    round: 9999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    xxxxl: 40,
  },
  typography: {
    sans: Platform.select({
      ios: 'System',
      android: 'sans-serif',
      web: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }),
    heading: {
      h1: { fontSize: 24, fontWeight: '800' as const, lineHeight: 32 },
      h2: { fontSize: 18, fontWeight: '700' as const, lineHeight: 26 },
      h3: { fontSize: 15, fontWeight: '700' as const, lineHeight: 22 },
      label: { fontSize: 12, fontWeight: '600' as const, lineHeight: 16 },
      caption: { fontSize: 11, fontWeight: '500' as const, lineHeight: 14 },
    },
  },
  animation: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
  shadows: Platform.select({
    ios: {
      shadowColor: '#64748B',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
    android: { elevation: 2 },
    web: {
      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
    },
    default: {
      shadowColor: '#64748B',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 2,
    },
  }),
  cardShadow: Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 16,
    },
    android: { elevation: 3 },
    web: {
      boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 10px 20px -4px rgba(15, 23, 42, 0.06)',
    },
    default: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 3,
    },
  }),
  elevatedShadow: Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
    },
    android: { elevation: 6 },
    web: {
      boxShadow: '0 12px 28px -6px rgba(15, 23, 42, 0.1), 0 4px 12px -2px rgba(15, 23, 42, 0.06)',
    },
    default: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.07,
      shadowRadius: 16,
      elevation: 5,
    },
  }),
};

export const getScoreColor = (score: number): string => {
  if (score >= 90) return Theme.colors.success;
  if (score >= 75) return Theme.colors.primary;
  if (score >= 50) return Theme.colors.warning;
  return Theme.colors.danger;
};
