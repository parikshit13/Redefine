import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, glassRecessed } from '../theme/tokens';
import GlassCard from '../components/GlassCard';
import IconPicker from '../components/IconPicker';
import ColorPicker from '../components/ColorPicker';
import FrequencyPills, { Frequency } from '../components/FrequencyPills';
import DayPicker from '../components/DayPicker';
import GoalStepper from '../components/GoalStepper';
import TimePickerModal, { formatDisplayTime } from '../components/TimePickerModal';
import { useHabits } from '../hooks/useHabits';
import { useToast } from '../components/Toast';
import { useAccent } from '../context/ThemeContext';

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
function ToggleSwitch({ value, onToggle, trackOnColor }: { value: boolean; onToggle: () => void; trackOnColor?: string }) {
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
      style={[styles.toggleTrack, value && [styles.toggleTrackOn, trackOnColor ? { backgroundColor: trackOnColor } : null]]}
    >
      <Animated.View
        style={[styles.toggleThumb, { transform: [{ translateX }] }]}
      />
    </Pressable>
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
  const params = useLocalSearchParams<{ habitId?: string }>();
  const editingId = typeof params.habitId === 'string' ? params.habitId : undefined;
  const isEdit = !!editingId;
  const toast = useToast();
  const { accent } = useAccent();
  const { habits, createHabit, updateHabit } = useHabits(toast.show);

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

  // Pre-populate once when editing an existing habit
  const populatedRef = useRef(false);
  useEffect(() => {
    if (!editingId || populatedRef.current) return;
    const existing = habits.find((h) => h.id === editingId);
    if (!existing) return;
    populatedRef.current = true;
    setName(existing.name);
    setIcon(existing.icon);
    if (['sage', 'lavender', 'peach', 'sky', 'rose'].includes(existing.color)) {
      setColor(existing.color as any);
    }
    setFrequency((existing.frequency as Frequency) || 'daily');
    const parsed = (existing.days || '')
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    const dayArr = [false, false, false, false, false, false, false];
    parsed.forEach((i) => {
      if (i >= 0 && i < 7) dayArr[i] = true;
    });
    setDays(dayArr);
    setReminderEnabled(!!existing.reminderEnabled);
    if (existing.reminderTime) setReminderTime(existing.reminderTime);
    if (existing.goalCount) setTimesPerDay(existing.goalCount);
    if (existing.goalDuration) setDuration(existing.goalDuration);
  }, [editingId, habits]);

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
      const payload = {
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
      };
      if (isEdit && editingId) {
        await updateHabit(editingId, payload);
      } else {
        await createHabit(payload);
      }
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
          style={[styles.saveButton, { backgroundColor: accent.dim, borderColor: accent.border }, (saving || !name.trim()) && { opacity: 0.5 }]}
        >
          {saving ? (
            <ActivityIndicator color={accent.hex} size="small" />
          ) : (
            <Text style={[styles.saveText, { color: accent.hex }]}>Save habit</Text>
          )}
        </Pressable>
      </View>

      {/* Title */}
      <Text style={[typography.displayMedium, styles.title]}>{isEdit ? 'Edit habit' : 'New habit'}</Text>

      {/* Habit name */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>HABIT NAME</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Morning run, Gratitude journal..."
          placeholderTextColor={colors.textMuted}
          style={styles.textInput}
          selectionColor={accent.hex}
        />
      </View>

      {/* Icon */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>ICON</Text>
        <IconPicker selected={icon} accentColor={accentMap[color]} onSelect={setIcon} />
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
                <Text style={[styles.reminderTime, { color: accent.hex }]}>{formatDisplayTime(reminderTime)}</Text>
              </Pressable>
              <ToggleSwitch
                value={reminderEnabled}
                onToggle={() => setReminderEnabled((v) => !v)}
                trackOnColor={accent.trackOn}
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
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  saveText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
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
  },

  // Toggle switch
  toggleTrack: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
  },
  toggleTrackOn: {},
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },

});
