export const colors = {
  // Backgrounds
  bgDeep: '#0B0D11',
  bgCard: 'rgba(255,255,255,0.04)',
  bgGlass: 'rgba(255,255,255,0.06)',
  bgGlassHover: 'rgba(255,255,255,0.10)',

  // Borders
  glassBorder: 'rgba(255,255,255,0.08)',
  glassHighlight: 'rgba(255,255,255,0.12)',
  glassBorderActive: 'rgba(255,255,255,0.15)',

  // Text
  textPrimary: 'rgba(255,255,255,0.92)',
  textSecondary: 'rgba(255,255,255,0.55)',
  textMuted: 'rgba(255,255,255,0.32)',

  // Accent palette — soft, muted tones
  sage: '#8BAF8B',
  sageDim: 'rgba(139,175,139,0.15)',
  sageBorder: 'rgba(139,175,139,0.12)',
  sageGlow: 'rgba(139,175,139,0.20)',

  lavender: '#A99BCC',
  lavenderDim: 'rgba(169,155,204,0.12)',

  peach: '#D4A589',
  peachDim: 'rgba(212,165,137,0.12)',

  sky: '#7BAFD4',
  skyDim: 'rgba(123,175,212,0.12)',

  rose: '#CC9BAF',
  roseDim: 'rgba(204,155,175,0.12)',
};

export const typography = {
  displayLarge: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 28,
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  displayMedium: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 24,
    letterSpacing: -0.4,
    color: colors.textPrimary,
  },
  heading: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 17,
    letterSpacing: -0.2,
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    color: colors.textPrimary,
  },
  body: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  caption: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: colors.textSecondary,
  },
  overline: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
    color: colors.textMuted,
  },
  micro: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 10,
    color: colors.textMuted,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const radii = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
};

export const glassSurface = {
  backgroundColor: colors.bgGlass,
  borderWidth: 1,
  borderColor: colors.glassBorder,
  borderRadius: radii.md,
};

export const glassRecessed = {
  backgroundColor: colors.bgCard,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.05)',
  borderRadius: radii.sm,
};

export const glassElevated = {
  backgroundColor: colors.bgGlassHover,
  borderWidth: 1,
  borderColor: colors.glassBorderActive,
  borderRadius: radii.md,
};

export const glassAccentSage = {
  backgroundColor: 'rgba(139,175,139,0.08)',
  borderWidth: 1,
  borderColor: colors.sageBorder,
  borderRadius: radii.lg,
};
