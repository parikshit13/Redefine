import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, radii } from '../theme/tokens';
import GlassCard from './GlassCard';

interface Props {
  visible: boolean;
  habitName: string;
  onEdit: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

export default function HabitActionSheet({ visible, habitName, onEdit, onDelete, onCancel }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.sheetWrap} onPress={() => {}}>
          <GlassCard style={styles.sheet}>
            <Text style={styles.title} numberOfLines={1}>{habitName}</Text>
            <Pressable onPress={onEdit} style={styles.row}>
              <Text style={styles.rowText}>Edit</Text>
            </Pressable>
            <View style={styles.divider} />
            <Pressable onPress={onDelete} style={styles.row}>
              <Text style={[styles.rowText, { color: colors.rose }]}>Delete</Text>
            </Pressable>
            <View style={styles.divider} />
            <Pressable onPress={onCancel} style={styles.row}>
              <Text style={[styles.rowText, { color: colors.textSecondary }]}>Cancel</Text>
            </Pressable>
          </GlassCard>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
    padding: spacing.base,
  },
  sheetWrap: {
    marginBottom: spacing.lg,
  },
  sheet: {
    padding: spacing.sm,
    borderRadius: radii.lg,
  },
  title: {
    ...typography.overline,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  row: {
    paddingVertical: spacing.base,
    alignItems: 'center',
  },
  rowText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 16,
    color: colors.textPrimary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
});
