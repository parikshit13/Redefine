import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../theme/tokens';

interface StreakItemProps {
  name: string;
  streak: number;
  accentColor: string;
  isLast?: boolean;
}

export default function StreakItem({ name, streak, accentColor, isLast }: StreakItemProps) {
  return (
    <View style={[styles.row, !isLast && styles.border]}>
      <View style={[styles.dot, { backgroundColor: accentColor }]} />
      <Text style={styles.name}>{name}</Text>
      <View style={styles.right}>
        <Text style={[styles.count, { color: accentColor }]}>{streak}</Text>
        <Text style={styles.days}>days</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  name: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: colors.textPrimary,
    flex: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  count: {
    fontSize: 18,
    fontWeight: '300',
  },
  days: {
    ...typography.micro,
  },
});
