import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing } from '../theme/tokens';
import { useAccent } from '../context/ThemeContext';

export function formatDisplayTime(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return hhmm;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

export function parseTime(hhmm: string): { h12: number; m: number; period: 'AM' | 'PM' } {
  const [hStr, mStr] = hhmm.split(':');
  const h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;
  const period: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return { h12, m, period };
}

export function toHHMM(h12: number, m: number, period: 'AM' | 'PM'): string {
  const h12Clamped = Math.min(12, Math.max(1, h12));
  const mClamped = Math.min(59, Math.max(0, m));
  let h24 = h12Clamped % 12;
  if (period === 'PM') h24 += 12;
  return `${String(h24).padStart(2, '0')}:${String(mClamped).padStart(2, '0')}`;
}

interface TimePickerModalProps {
  visible: boolean;
  value: string;
  title?: string;
  onClose: () => void;
  onSave: (v: string) => void;
}

export default function TimePickerModal({
  visible,
  value,
  title = 'Reminder time',
  onClose,
  onSave,
}: TimePickerModalProps) {
  const { accent } = useAccent();
  const initial = parseTime(value);
  const [hours, setHours] = useState(String(initial.h12));
  const [minutes, setMinutes] = useState(String(initial.m).padStart(2, '0'));
  const [period, setPeriod] = useState<'AM' | 'PM'>(initial.period);

  useEffect(() => {
    if (visible) {
      const p = parseTime(value);
      setHours(String(p.h12));
      setMinutes(String(p.m).padStart(2, '0'));
      setPeriod(p.period);
    }
  }, [visible, value]);

  const handleSave = () => {
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);
    onSave(
      toHHMM(
        Number.isFinite(h) ? h : 12,
        Number.isFinite(m) ? m : 0,
        period,
      ),
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={() => {}}>
          <Text style={styles.modalTitle}>{title}</Text>

          <View style={styles.timeRow}>
            <TextInput
              value={hours}
              onChangeText={(t) => setHours(t.replace(/[^0-9]/g, '').slice(0, 2))}
              keyboardType="number-pad"
              maxLength={2}
              style={styles.timeInput}
              selectionColor={accent.hex}
            />
            <Text style={styles.timeColon}>:</Text>
            <TextInput
              value={minutes}
              onChangeText={(t) => setMinutes(t.replace(/[^0-9]/g, '').slice(0, 2))}
              keyboardType="number-pad"
              maxLength={2}
              style={styles.timeInput}
              selectionColor={accent.hex}
            />
          </View>

          <View style={styles.periodRow}>
            {(['AM', 'PM'] as const).map((p) => {
              const active = period === p;
              return (
                <Pressable
                  key={p}
                  onPress={() => setPeriod(p)}
                  style={[styles.periodPill, active && { backgroundColor: accent.dim, borderColor: accent.border }]}
                >
                  <Text
                    style={[styles.periodText, active && { color: accent.hex }]}
                  >
                    {p}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.modalActions}>
            <Pressable onPress={onClose} style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleSave} style={[styles.modalSave, { backgroundColor: accent.dim, borderColor: accent.border }]}>
              <Text style={[styles.modalSaveText, { color: accent.hex }]}>Save</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#14171C',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 20,
    padding: spacing.lg,
  },
  modalTitle: {
    ...typography.overline,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: spacing.lg,
  },
  timeInput: {
    width: 72,
    height: 64,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    textAlign: 'center',
    fontFamily: 'DMSans_500Medium',
    fontSize: 28,
    color: colors.textPrimary,
  },
  timeColon: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 28,
    color: colors.textSecondary,
  },
  periodRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: spacing.lg,
  },
  periodPill: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 20,
    backgroundColor: colors.bgGlass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  periodText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: colors.textSecondary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.bgGlass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
  },
  modalCancelText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: colors.textSecondary,
  },
  modalSave: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalSaveText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
  },
});
