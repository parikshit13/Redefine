import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Animated,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, glassRecessed } from '../theme/tokens';
import GlassCard from '../components/GlassCard';
import IconPicker from '../components/IconPicker';
import ColorPicker from '../components/ColorPicker';
import FrequencyPills, { Frequency } from '../components/FrequencyPills';
import DayPicker from '../components/DayPicker';
import GoalStepper from '../components/GoalStepper';

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
  const navigation = useNavigation<any>();

  // Form state
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('dumbbell');
  const [color, setColor] = useState<'sage' | 'lavender' | 'peach' | 'sky' | 'rose'>('sage');
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [days, setDays] = useState<boolean[]>([...ALL_DAYS]);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [timesPerDay, setTimesPerDay] = useState(1);
  const [duration, setDuration] = useState(5);

  const accent = accentMap[color];

  // Sync days when frequency changes
  const handleFrequencyChange = (f: Frequency) => {
    setFrequency(f);
    if (f === 'daily') setDays([...ALL_DAYS]);
    else if (f === 'weekdays') setDays([...WEEKDAYS]);
    // 'custom' keeps current selection
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
    navigation.navigate('Home');
  };

  const handleSave = () => {
    // TODO: persist habit via context
    navigation.navigate('Home');
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.base }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={handleCancel} style={styles.cancelButton}>
          <BackArrow />
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <Pressable onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveText}>Save habit</Text>
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
              <Text style={styles.reminderTime}>7:00 AM</Text>
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
        />
      </View>
    </ScrollView>
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
});
