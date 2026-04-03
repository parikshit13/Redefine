import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../theme/tokens';
import type { CompletionRecord } from '../hooks/useCompletions';

const LEVEL_COLORS = [
  'rgba(255,255,255,0.04)',     // 0 — empty
  'rgba(139,175,139,0.15)',     // 1
  'rgba(139,175,139,0.30)',     // 2
  'rgba(139,175,139,0.50)',     // 3
  'rgba(139,175,139,0.75)',     // 4
];

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface HeatmapGridProps {
  completions?: CompletionRecord[];
  totalHabits?: number;
}

function getMonthLabel(): string {
  const months = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
  ];
  return months[new Date().getMonth()];
}

/** Build weeks grid from completions data for the current month */
function buildHeatmapData(
  completions: CompletionRecord[],
  totalHabits: number,
): number[][] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  // Count completions per date
  const countByDate = new Map<string, number>();
  for (const c of completions) {
    countByDate.set(c.date, (countByDate.get(c.date) || 0) + 1);
  }

  // Find the first day of the month and its weekday (0=Mon..6=Sun)
  const firstDay = new Date(year, month, 1);
  const firstDayIndex = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build weeks
  const weeks: number[][] = [];
  let currentWeek: number[] = [];

  // Fill leading empty cells
  for (let i = 0; i < firstDayIndex; i++) {
    currentWeek.push(-1); // -1 = placeholder
  }

  for (let day = 1; day <= daysInMonth; day++) {
    if (day > today) {
      currentWeek.push(-1); // future day
    } else {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const count = countByDate.get(dateStr) || 0;

      // Map count to level 0–4 based on ratio to totalHabits
      let level = 0;
      if (totalHabits > 0 && count > 0) {
        const ratio = count / totalHabits;
        if (ratio >= 0.75) level = 4;
        else if (ratio >= 0.5) level = 3;
        else if (ratio >= 0.25) level = 2;
        else level = 1;
      }
      currentWeek.push(level);
    }

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Fill trailing cells in last partial week
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(-1);
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

export default function HeatmapGrid({ completions = [], totalHabits = 5 }: HeatmapGridProps) {
  const heatmapData = buildHeatmapData(completions, totalHabits);
  const monthLabel = getMonthLabel();

  return (
    <View style={styles.container}>
      {/* Section label */}
      <Text style={styles.sectionLabel}>ACTIVITY HEATMAP — {monthLabel}</Text>

      {/* Day headers */}
      <View style={styles.headerRow}>
        {DAY_HEADERS.map((d) => (
          <Text key={d} style={styles.dayHeader}>{d}</Text>
        ))}
      </View>

      {/* Grid */}
      {heatmapData.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map((level, di) => {
            const isPlaceholder = level === -1;
            return (
              <View
                key={di}
                style={[
                  styles.cell,
                  {
                    backgroundColor: isPlaceholder
                      ? 'transparent'
                      : LEVEL_COLORS[level],
                  },
                  isPlaceholder && { borderWidth: 0 },
                ]}
              />
            );
          })}
        </View>
      ))}

      {/* Legend */}
      <View style={styles.legendRow}>
        <Text style={styles.legendText}>Less</Text>
        {LEVEL_COLORS.map((c, i) => (
          <View key={i} style={[styles.legendCell, { backgroundColor: c }]} />
        ))}
        <Text style={styles.legendText}>More</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    ...typography.overline,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  dayHeader: {
    ...typography.micro,
    flex: 1,
    textAlign: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
    gap: 3,
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 4,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    gap: 4,
  },
  legendText: {
    ...typography.micro,
    marginHorizontal: 4,
  },
  legendCell: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
});
