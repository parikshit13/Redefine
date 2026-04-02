import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlassCard from './GlassCard';
import { colors, typography, spacing, radii } from '../theme/tokens';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const BAR_HEIGHTS = [0.85, 1.0, 0.70, 0.90, 0.60, 0.80, 0.40];
const BAR_AREA_HEIGHT = 120;
const PILLS = ['Week', 'Month', 'Year'];

export default function BarChart() {
  const [activePill, setActivePill] = useState('Week');
  // Sunday is the "today" bar per spec
  const todayIndex = 6;

  return (
    <GlassCard style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={typography.sectionTitle}>Weekly completion</Text>
        <View style={styles.pills}>
          {PILLS.map((pill) => (
            <Pressable
              key={pill}
              onPress={() => setActivePill(pill)}
              style={[
                styles.pill,
                activePill === pill && styles.pillActive,
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  activePill === pill && styles.pillTextActive,
                ]}
              >
                {pill}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Bars */}
      <View style={styles.barsRow}>
        {DAYS.map((day, i) => {
          const height = BAR_HEIGHTS[i] * BAR_AREA_HEIGHT;
          const isToday = i === todayIndex;
          return (
            <View key={day} style={styles.barColumn}>
              <LinearGradient
                colors={['rgba(139,175,139,0.30)', 'rgba(139,175,139,1.0)']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={[
                  styles.bar,
                  { height },
                  isToday && { opacity: 0.45 },
                ]}
              />
            </View>
          );
        })}
      </View>
      {/* Day labels */}
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
  pillActive: {
    backgroundColor: colors.sageDim,
    borderColor: colors.sageBorder,
  },
  pillText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 10,
    color: colors.textSecondary,
  },
  pillTextActive: {
    color: colors.sage,
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
