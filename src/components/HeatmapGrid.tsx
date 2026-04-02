import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../theme/tokens';

// 5 weeks of March data (Mon–Sun per row), levels 0–4
const HEATMAP_DATA: number[][] = [
  //Mon Tue Wed Thu Fri Sat Sun
  [0,  2,  1,  3,  2,  1,  0],   // week 1 (Mar 2–8)
  [3,  4,  3,  4,  2,  3,  1],   // week 2 (Mar 9–15)
  [2,  3,  4,  3,  4,  2,  1],   // week 3 (Mar 16–22)
  [4,  3,  2,  4,  3,  4,  2],   // week 4 (Mar 23–29)
  [3,  4,  0,  0,  0,  0,  0],   // week 5 (Mar 30–31 + empty)
];

const LEVEL_COLORS = [
  'rgba(255,255,255,0.04)',     // 0 — empty
  'rgba(139,175,139,0.15)',     // 1
  'rgba(139,175,139,0.30)',     // 2
  'rgba(139,175,139,0.50)',     // 3
  'rgba(139,175,139,0.75)',     // 4
];

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function HeatmapGrid() {
  return (
    <View style={styles.container}>
      {/* Section label */}
      <Text style={styles.sectionLabel}>ACTIVITY HEATMAP — MARCH</Text>

      {/* Day headers */}
      <View style={styles.headerRow}>
        {DAY_HEADERS.map((d) => (
          <Text key={d} style={styles.dayHeader}>{d}</Text>
        ))}
      </View>

      {/* Grid */}
      {HEATMAP_DATA.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map((level, di) => {
            // Hide trailing empty cells in last partial week
            const isPlaceholder = wi === HEATMAP_DATA.length - 1 && di > 1;
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
