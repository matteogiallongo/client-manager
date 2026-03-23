export const colors = {
  background: '#080808',
  surface: '#141414',
  elevated: '#1e1e1e',
  surfaceBright: '#ffed43',
  border: 'rgba(255,255,255,0.06)',
  borderFocus: '#ffed43',
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255,255,255,0.50)',
  textTertiary: 'rgba(255,255,255,0.28)',
  textOnBright: '#0a0a0a',
  accent: '#ffed43',
  accentSecondary: '#d4c638',
  accentMuted: 'rgba(255,237,67,0.15)',
  accentDim: 'rgba(255,237,67,0.08)',
  statusGreen: '#4adf6f',
  statusRed: '#ff5c5c',
  statusYellow: '#ffed43',
  statusBlue: '#5ca0ff',
  statusPurple: '#b07cff',
  statusOrange: '#ff9f43',
  overlay: 'rgba(0,0,0,0.88)',
};

export const fonts = {
  // Titoli e numeri grandi — DM Sans Bold (già installato, nessun pacchetto extra)
  displayBold: 'DMSans_700Bold',
  displaySemiBold: 'DMSans_700Bold',
  displayMedium: 'DMSans_500Medium',
  displayRegular: 'DMSans_400Regular',
  displayLight: 'DMSans_400Regular',
  displayItalic: 'DMSans_400Regular',
  // Corpo testo e UI
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodyBold: 'DMSans_700Bold',
  // Date e valori numerici
  mono: 'JetBrainsMono_400Regular',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 100,
};

export const statusColors: Record<string, string> = {
  'Da contattare': 'rgba(255,255,255,0.3)',
  'Contattato': '#5ca0ff',
  'In trattativa': '#b07cff',
  'Proposta inviata': '#ffed43',
  'Cliente attivo': '#4adf6f',
  'In pausa': '#ff9f43',
  'Archiviato': 'rgba(255,92,92,0.7)',
};

export const priorityColors: Record<string, string> = {
  'Alta': '#ff5c5c',
  'Media': '#ffed43',
  'Bassa': 'rgba(255,255,255,0.25)',
};
