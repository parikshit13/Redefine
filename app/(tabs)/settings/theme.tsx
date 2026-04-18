import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing } from '../../../src/theme/tokens';
import GlassCard from '../../../src/components/GlassCard';
import SettingsHeader from '../../../src/components/SettingsHeader';
import { useAccent, ACCENT_MAP, AccentName } from '../../../src/context/ThemeContext';

const ACCENT_OPTIONS: { name: AccentName; hex: string }[] = [
  { name: 'sage', hex: colors.sage },
  { name: 'lavender', hex: colors.lavender },
  { name: 'peach', hex: colors.peach },
  { name: 'sky', hex: colors.sky },
  { name: 'rose', hex: colors.rose },
];

function CheckIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 6L9 17l-5-5"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function ThemeScreen() {
  const { accentName, accent, setAccentName } = useAccent();

  return (
    <View style={styles.screen}>
      <SettingsHeader title="Theme" />
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Theme mode */}
      <Text style={styles.sectionLabel}>APPEARANCE</Text>
      <GlassCard style={styles.card}>
        {/* Dark — selected */}
        <Pressable style={styles.themeRow}>
          <Text style={styles.themeRowText}>Dark</Text>
          <CheckIcon color={accent.hex} />
        </Pressable>

        <View style={styles.divider} />

        {/* Light — coming soon */}
        <View style={styles.themeRow}>
          <Text style={styles.themeRowTextDisabled}>Light</Text>
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>Coming soon</Text>
          </View>
        </View>
      </GlassCard>

      {/* Accent color */}
      <Text style={styles.sectionLabel}>ACCENT COLOR</Text>
      <GlassCard style={styles.accentCard}>
        <View style={styles.accentRow}>
          {ACCENT_OPTIONS.map(({ name, hex }) => {
            const isActive = accentName === name;
            return (
              <Pressable
                key={name}
                onPress={() => setAccentName(name)}
                style={styles.accentWrapper}
              >
                {isActive && (
                  <View style={[styles.outerRing, { borderColor: 'rgba(255,255,255,0.2)' }]} />
                )}
                <View
                  style={[
                    styles.accentCircle,
                    { backgroundColor: hex },
                    isActive && styles.accentCircleActive,
                  ]}
                />
                <Text style={[styles.accentLabel, isActive && { color: hex }]}>
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </GlassCard>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.base,
  },

  sectionLabel: {
    ...typography.overline,
    marginBottom: spacing.md,
  },

  card: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.lg,
  },

  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  themeRowText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    color: colors.textPrimary,
  },
  themeRowTextDisabled: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  comingSoonBadge: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: colors.bgGlass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  comingSoonText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 10,
    color: colors.textMuted,
  },

  // Accent
  accentCard: {
    padding: spacing.base,
    marginBottom: spacing.lg,
  },
  accentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  accentWrapper: {
    alignItems: 'center',
    gap: 8,
    position: 'relative',
  },
  outerRing: {
    position: 'absolute',
    top: -5,
    left: '50%',
    marginLeft: -29,
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
  },
  accentCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  accentCircleActive: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  accentLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: colors.textSecondary,
  },
});
