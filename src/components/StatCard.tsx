import React from 'react';
import { Text, StyleSheet } from 'react-native';
import GlassCard from './GlassCard';
import { colors, typography, spacing } from '../theme/tokens';

interface StatCardProps {
  value: string;
  label: string;
  sub: string;
  accentColor?: string;
}

export default function StatCard({ value, label, sub, accentColor }: StatCardProps) {
  return (
    <GlassCard style={styles.card}>
      <Text style={[styles.value, accentColor ? { color: accentColor } : null]}>
        {value}
      </Text>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.sub}>{sub}</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: spacing.base,
  },
  value: {
    fontSize: 32,
    fontWeight: '300',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  label: {
    ...typography.caption,
  },
  sub: {
    ...typography.micro,
    marginTop: 2,
  },
});
