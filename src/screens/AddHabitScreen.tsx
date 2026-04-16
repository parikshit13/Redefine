import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Animated,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, glassRecessed } from '../theme/tokens';
import GlassCard from '../components/GlassCard';
import IconPicker from '../components/IconPicker';
import ColorPicker from '../components/ColorPicker';
import FrequencyPills, { Frequency } from '../components/FrequencyPills';
import DayPicker from '../components/DayPicker';
import GoalStepper from '../components/GoalStepper';
import { useHabits } from '../hooks/useHabits';
import { useToast } from '../components/Toast';

const ALL_DAYS = [true, true, true, true, true, true, true];
const WEEKDAYS = [true, true, true, true, true, false, false];

const accentMap: Record<string, string> = {
  sage: colors.sage,
  lavender: colors.lavender,
  peach: colors.peach,
  sky: colors.sky,
  rose: colors.rose,
};

// --- Animated toggle switch ---
function ToggleSwitch({ value, onToggle }: { value: boolean; onToggle: () => void }) {
  const translateX = useRef(new Animated.Value(value ? 20 : 2)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: value ? 20 : 2,
      useNativeDriver: true,
      speed: 28,
      bounciness: 6,
    }).start();
  }, [value]);

  return (
    <Pressable
      onPress={onToggle}
      style={[styles.toggleTrack, value && styles.toggleTrackOn]}
    >
      <Animated.View
        style={[styles.toggleThumb, { transform: [{ translateX }] }]}
      />
    </Pressable>
  );
}

// --- Time formatting helpers ---
function formatDisplayTime(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return hhmm;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

function parseTime(hhmm: string): { h12: number; m: number; period: 'AM' | 'PM' } {
  const [hStr, mStr] = hhmm.split(':');
  const h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;
  const period: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return { h12, m, period };
}

function toHHMM(h12: number, m: number, period: 'AM' | 'PM'): string {
  const h12Clamped = Math.min(12, Math.max(1, h12));
  const mClamped = Math.min(59, Math.max(0, m));
  let h24 = h12Clamped % 12;
  if (period === 'PM') h24 += 12;
  return `${String(h24).padStart(2, '0')}:${String(mClamped).padStart(2, '0')}`;
}

// --- Time picker modal ---
function TimePickerModal({
  visible,
  value,
  onClose,
  onSave,
}: {
  visible: boolean;
  value: string;
  onClose: () => void;
  onSave: (v: string) => void;
}) {
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
          <Text style={styles.modalTitle}>Reminder time</Text>

          <View style={styles.timeRow}>
            <TextInput
              value={hours}
              onChangeText={(t) => setHours(t.replace(/[^0-9]/g, '').slice(0, 2))}
              keyboardType="number-pad"
              maxLength={2}
              style={styles.timeInput}
              selectionColor={colors.sage}
            />
            <Text style={styles.timeColon}>:</Text>
            <TextInput
              value={minutes}
              onChangeText={(t) => setMinutes(t.replace(/[^0-9]/g, '').slice(0, 2))}
              keyboardType="number-pad"
              maxLength={2}
              style={styles.timeInput}
              selectionColor={colors.sage}
            />
          </View>

          <View style={styles.periodRow}>
            {(['AM', 'PM'] as const).map((p) => {
              const active = period === p;
              return (
                <Pressable
                  key={p}
                  onPress={() => setPeriod(p)}
                  style={[styles.periodPill, active && styles.periodPillActive]}
                >
                  <Text
                    style={[styles.periodText, active && styles.periodTextActive]}
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
            <Pressable onPress={handleSave} style={styles.modalSave}>
              <Text style={styles.modalSaveText}>Save</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// --- Back arrow icon ---
function BackArrow() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 12H5M12 19l-7-7 7-7"
        stroke={colors.textSecondary}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// --- Screen ---
export default function AddHabitScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const { createHabit } = useHabits(toast.show);

  // Form state
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('dumbbell');
  const [color, setColor] = useState<'sage' | 'lavender' | 'peach' | 'sky' | 'rose'>('sage');
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [days, setDays] = useState<boolean[]>([...ALL_DAYS]);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('07:00');
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const s = Keyboard.addListener(showEvt, () => setKeyboardOpen(true));
    const h = Keyboard.addListener(hideEvt, () => setKeyboardOpen(false));
    return () => {
      s.remove();
      h.remove();
    };
  }, []);
  const [timesPerDay, setTimesPerDay] = useState(1);
  const [duration, setDuration] = useState(5);
  const [saving, setSaving] = useState(false);

  const accent = accentMap[color];

  // Sync days when frequency changes
  const handleFrequencyChange = (f: Frequency) => {
    setFrequency(f);
    if (f === 'daily') setDays([...ALL_DAYS]);
    else if (f === 'weekdays') setDays([...WEEKDAYS]);
  };

  const handleDayToggle = (index: number) => {
    setFrequency('custom');
    setDays((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const handleCancel = () => {
    router.push('/');
  };

  const handleSave = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);

    // Convert boolean[] days to comma-separated index string
    const daysStr = days
      .map((selected, i) => (selected ? i : -1))
      .filter((i) => i >= 0)
      .join(',');

    try {
      await createHabit({
        name: name.trim(),
        icon,
        color,
        timeLabel: '',
        frequency,
        days: daysStr,
        reminderTime: reminderEnabled ? reminderTime : null,
        reminderEnabled,
        goalCount: timesPerDay,
        goalDuration: duration,
      });
    } catch (err: any) {
      toast.show(err.message || 'Failed to save habit');
    } finally {
      // Reset form state to defaults
      setName('');
      setIcon('dumbbell');
      setColor('sage');
      setFrequency('daily');
      setDays([...ALL_DAYS]);
      setReminderEnabled(true);
      setReminderTime('07:00');
      setTimesPerDay(1);
      setDuration(5);
      setSaving(false);
    }

    // Navigate back — HomeScreen's useFocusEffect will refetch
    router.push('/');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0D11' }}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#0B0D11' }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
    >
    <ScrollView
      ref={scrollRef}
      style={{ flex: 1, backgroundColor: '#0B0D11' }}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + spacing.base,
          paddingBottom: keyboardOpen ? 20 : spacing.xxl + 20,
          backgroundColor: '#0B0D11',
        },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={handleCancel} style={styles.cancelButton}>
          <BackArrow />
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <Pressable
          onPress={handleSave}
          disabled={saving || !name.trim()}
          style={[styles.saveButton, (saving || !name.trim()) && { opacity: 0.5 }]}
        >
          {saving ? (
            <ActivityIndicator color={colors.sage} size="small" />
          ) : (
            <Text style={styles.saveText}>Save habit</Text>
          )}
        </Pressable>
      </View>

      {/* Title */}
      <Text style={[typography.displayMedium, styles.title]}>New habit</Text>

      {/* Habit name */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>HABIT NAME</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Morning run, Gratitude journal..."
          placeholderTextColor={colors.textMuted}
          style={styles.textInput}
          selectionColor={colors.sage}
        />
      </View>

      {/* Icon */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>ICON</Text>
        <IconPicker selected={icon} accentColor={accent} onSelect={setIcon} />
      </View>

      {/* Color */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>COLOR</Text>
        <ColorPicker selected={color} onSelect={setColor} />
      </View>

      {/* Frequency */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>FREQUENCY</Text>
        <FrequencyPills selected={frequency} onSelect={handleFrequencyChange} />
      </View>

      {/* Days */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>DAYS</Text>
        <DayPicker selected={days} onToggle={handleDayToggle} />
      </View>

      {/* Reminder */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>REMINDER</Text>
        <GlassCard style={styles.reminderCard}>
          <View style={styles.reminderRow}>
            <View>
              <Text style={styles.reminderTitle}>Remind me at</Text>
              <Text style={styles.reminderSub}>Push notification</Text>
            </View>
            <View style={styles.reminderRight}>
              <Pressable onPress={() => setTimeModalVisible(true)} hitSlop={6}>
                <Text style={styles.reminderTime}>{formatDisplayTime(reminderTime)}</Text>
              </Pressable>
              <ToggleSwitch
                value={reminderEnabled}
                onToggle={() => setReminderEnabled((v) => !v)}
              />
            </View>
          </View>
        </GlassCard>
      </View>

      {/* Goal */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>GOAL</Text>
        <GoalStepper
          timesPerDay={timesPerDay}
          duration={duration}
          onTimesChange={setTimesPerDay}
          onDurationChange={setDuration}
          onEditFocus={() =>
            setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50)
          }
        />
      </View>

      <TimePickerModal
        visible={timeModalVisible}
        value={reminderTime}
        onClose={() => setTimeModalVisible(false)}
        onSave={(v) => {
          setReminderTime(v);
          setTimeModalVisible(false);
        }}
      />
    </ScrollView>
    </KeyboardAvoidingView>
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
    paddingBottom: spacing.xxl + 20,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cancelText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: colors.textSecondary,
  },
  saveButton: {
    backgroundColor: colors.sageDim,
    borderWidth: 1,
    borderColor: colors.sageBorder,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  saveText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: colors.sage,
  },

  // Title
  title: {
    marginBottom: spacing.lg,
  },

  // Form fields
  fieldGroup: {
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    ...typography.overline,
    marginBottom: spacing.md,
  },

  // Text input
  textInput: {
    ...glassRecessed,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: colors.textPrimary,
  },

  // Reminder
  reminderCard: {
    padding: spacing.base,
  },
  reminderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderTitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.textPrimary,
  },
  reminderSub: {
    ...typography.micro,
    marginTop: 3,
  },
  reminderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reminderTime: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: colors.sage,
  },

  // Toggle switch
  toggleTrack: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
  },
  toggleTrackOn: {
    backgroundColor: 'rgba(139,175,139,0.50)',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },

  // Time picker modal
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
  periodPillActive: {
    backgroundColor: colors.sageDim,
    borderColor: colors.sageBorder,
  },
  periodText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: colors.textSecondary,
  },
  periodTextActive: {
    color: colors.sage,
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
    backgroundColor: colors.sageDim,
    borderWidth: 1,
    borderColor: colors.sageBorder,
    alignItems: 'center',
  },
  modalSaveText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: colors.sage,
  },
});
