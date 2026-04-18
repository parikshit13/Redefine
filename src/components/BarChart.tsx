import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlassCard from './GlassCard';
import { colors, typography, spacing } from '../theme/tokens';
import { useAccent } from '../context/ThemeContext';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const BAR_AREA_HEIGHT = 120;
const PILLS = ['Week', 'Month', 'Year'];

interface BarChartProps {
  weeklyCompletion?: number[];
}

export default function BarChart({ weeklyCompletion }: BarChartProps) {
  const [activePill, setActivePill] = useState('Week');
  const { accent } = useAccent();
  const data = weeklyCompletion || [0, 0, 0, 0, 0, 0, 0];

  const jsDay = new Date().getDay();
  const todayIndex = jsDay === 0 ? 6 : jsDay - 1;

  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <Text style={typography.sectionTitle}>Weekly completion</Text>
        <View style={styles.pills}>
          {PILLS.map((pill) => (
            <Pressable
              key={pill}
              onPress={() => setActivePill(pill)}
              style={[
                styles.pill,
                activePill === pill && { backgroundColor: accent.dim, borderColor: accent.border },
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  activePill === pill && { color: accent.hex },
                ]}
              >
                {pill}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.barsRow}>
        {DAYS.map((day, i) => {
          const pct = data[i] || 0;
          const height = (pct / 100) * BAR_AREA_HEIGHT;
          const isToday = i === todayIndex;
          return (
            <View key={day} style={styles.barColumn}>
              <LinearGradient
                colors={[`${accent.hex}4D`, accent.hex]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={[
                  styles.bar,
                  { height: Math.max(height, 2) },
                  isToday && { opacity: 0.45 },
                ]}
              />
            </View>
          );
        })}
      </View>
      <View style={styles.labelsRow}>
        {DAYS.map((day) => (
          <Text key={day} style={styles.barLabel}>{day}</Text>
        ))}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.base,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  pills: {
    flexDirection: 'row',
    gap: 6,
  },
  pill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: colors.bgGlass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  pillText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 10,
    color: colors.textSecondary,
  },
  barsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: BAR_AREA_HEIGHT,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
  },
  bar: {
    width: '55%',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  barLabel: {
    ...typography.micro,
    flex: 1,
    textAlign: 'center',
  },
});
