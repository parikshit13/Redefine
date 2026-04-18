import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import Svg, { Path } from 'react-native-svg';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { colors, typography, spacing } from '../../../src/theme/tokens';
import GlassCard from '../../../src/components/GlassCard';
import SettingsHeader from '../../../src/components/SettingsHeader';
import { useToast } from '../../../src/components/Toast';
import { useAccent } from '../../../src/context/ThemeContext';

// --- SVG Icons ---

function DownloadIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M7 10l5 5 5-5" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 15V3" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function FileIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M14 2v6h6" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16 13H8M16 17H8M10 9H8" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CalendarIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChevronLeft({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ChevronRight({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// --- Helpers ---

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function formatDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// --- Date Picker Modal ---

function DatePickerModal({
  visible,
  value,
  minDate,
  maxDate,
  onClose,
  onSelect,
  title,
}: {
  visible: boolean;
  value: Date;
  minDate?: Date;
  maxDate?: Date;
  onClose: () => void;
  onSelect: (d: Date) => void;
  title: string;
}) {
  const { accent } = useAccent();
  const [viewYear, setViewYear] = useState(value.getFullYear());
  const [viewMonth, setViewMonth] = useState(value.getMonth());

  useEffect(() => {
    if (visible) {
      setViewYear(value.getFullYear());
      setViewMonth(value.getMonth());
    }
  }, [visible, value]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isDisabled = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    if (minDate && d < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) return true;
    if (maxDate && d > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())) return true;
    return false;
  };

  const isSelected = (day: number) => {
    return sameDay(new Date(viewYear, viewMonth, day), value);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={pickerStyles.overlay} onPress={onClose}>
        <Pressable style={pickerStyles.card} onPress={() => {}}>
          <Text style={pickerStyles.title}>{title}</Text>

          <View style={pickerStyles.header}>
            <Pressable onPress={prevMonth} hitSlop={12}>
              <ChevronLeft color={colors.textSecondary} />
            </Pressable>
            <Text style={pickerStyles.monthYear}>
              {MONTHS[viewMonth]} {viewYear}
            </Text>
            <Pressable onPress={nextMonth} hitSlop={12}>
              <ChevronRight color={colors.textSecondary} />
            </Pressable>
          </View>

          <View style={pickerStyles.weekRow}>
            {DAY_LABELS.map((label) => (
              <View key={label} style={pickerStyles.dayCell}>
                <Text style={pickerStyles.weekLabel}>{label}</Text>
              </View>
            ))}
          </View>

          <View style={pickerStyles.grid}>
            {cells.map((day, i) => (
              <View key={i} style={pickerStyles.dayCell}>
                {day != null ? (
                  <Pressable
                    onPress={() => {
                      if (!isDisabled(day)) {
                        onSelect(new Date(viewYear, viewMonth, day));
                        onClose();
                      }
                    }}
                    style={[
                      pickerStyles.dayButton,
                      isSelected(day) && { backgroundColor: accent.dim, borderColor: accent.border, borderWidth: 1 },
                      isDisabled(day) && { opacity: 0.25 },
                    ]}
                  >
                    <Text
                      style={[
                        pickerStyles.dayText,
                        isSelected(day) && { color: accent.hex },
                      ]}
                    >
                      {day}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ))}
          </View>

          <Pressable onPress={onClose} style={pickerStyles.cancelButton}>
            <Text style={pickerStyles.cancelText}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const pickerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#14171C',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 20,
    padding: spacing.lg,
  },
  title: {
    ...typography.overline,
    textAlign: 'center',
    marginBottom: spacing.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
  },
  monthYear: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 16,
    color: colors.textPrimary,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.base,
  },
  dayCell: {
    width: '14.28%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3,
  },
  dayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: colors.bgGlass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: colors.textSecondary,
  },
});

// --- Export Screen ---

export default function ExportScreen() {
  const { getToken } = useAuth();
  const toast = useToast();
  const { accent } = useAccent();

  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [fromDate, setFromDate] = useState(thirtyDaysAgo);
  const [toDate, setToDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const from = toDateString(fromDate);
      const to = toDateString(toDate);

      const API_BASE = process.env.EXPO_PUBLIC_API_URL || '';
      const res = await fetch(`${API_BASE}/api/export?from=${from}&to=${to}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Export failed');
      }

      const csv = await res.text();

      const file = new File(Paths.document, `redefine-export-${from}-to-${to}.csv`);
      file.write(csv);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Habit Data',
          UTI: 'public.comma-separated-values-text',
        });
        toast.show('Export ready');
      } else {
        toast.show('File saved successfully');
      }
    } catch (err: any) {
      toast.show(err?.message || 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <SettingsHeader title="Export data" />
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Explanation card */}
      <GlassCard style={styles.explainCard}>
        <View style={styles.explainHeader}>
          <View style={[styles.iconBox, { backgroundColor: accent.dim }]}>
            <FileIcon color={accent.hex} />
          </View>
          <Text style={styles.explainTitle}>CSV Export</Text>
        </View>
        <Text style={styles.explainBody}>
          Export all your habits and completion history as a CSV file. The export
          includes each habit's daily completion status and streak count for the
          selected date range. You can open it in Excel, Google Sheets, or any
          spreadsheet app.
        </Text>
        <View style={styles.columnPreview}>
          <Text style={styles.columnLabel}>Columns included:</Text>
          <Text style={styles.columnList}>Date, Habit Name, Completed, Streak</Text>
        </View>
      </GlassCard>

      {/* Date range selector */}
      <Text style={styles.sectionLabel}>DATE RANGE</Text>

      <GlassCard style={styles.dateCard}>
        <Pressable onPress={() => setShowFromPicker(true)} style={styles.dateRow}>
          <View style={styles.dateLeft}>
            <CalendarIcon color={colors.textSecondary} />
            <Text style={styles.dateLabel}>From</Text>
          </View>
          <Text style={[styles.dateValue, { color: accent.hex }]}>
            {formatDisplay(fromDate)}
          </Text>
        </Pressable>

        <View style={styles.dateDivider} />

        <Pressable onPress={() => setShowToPicker(true)} style={styles.dateRow}>
          <View style={styles.dateLeft}>
            <CalendarIcon color={colors.textSecondary} />
            <Text style={styles.dateLabel}>To</Text>
          </View>
          <Text style={[styles.dateValue, { color: accent.hex }]}>
            {formatDisplay(toDate)}
          </Text>
        </Pressable>
      </GlassCard>

      {/* Export button */}
      <Pressable
        onPress={handleExport}
        disabled={loading}
        style={[
          styles.exportButton,
          { backgroundColor: accent.dim, borderColor: accent.border },
          loading && { opacity: 0.6 },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={accent.hex} size="small" />
        ) : (
          <>
            <DownloadIcon color={accent.hex} />
            <Text style={[styles.exportButtonText, { color: accent.hex }]}>
              Export as CSV
            </Text>
          </>
        )}
      </Pressable>

      <Text style={styles.footerNote}>
        The file will open in your device's share sheet so you can save, email,
        or send it to any app.
      </Text>

      {/* Date picker modals */}
      <DatePickerModal
        visible={showFromPicker}
        value={fromDate}
        maxDate={toDate}
        onClose={() => setShowFromPicker(false)}
        onSelect={setFromDate}
        title="SELECT START DATE"
      />
      <DatePickerModal
        visible={showToPicker}
        value={toDate}
        minDate={fromDate}
        maxDate={today}
        onClose={() => setShowToPicker(false)}
        onSelect={setToDate}
        title="SELECT END DATE"
      />
    </ScrollView>
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
    paddingBottom: spacing.xxl,
    paddingTop: spacing.base,
  },

  // Explanation card
  explainCard: {
    padding: spacing.base,
    marginBottom: spacing.lg,
  },
  explainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  explainTitle: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 16,
    color: colors.textPrimary,
  },
  explainBody: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  columnPreview: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  columnLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 4,
  },
  columnList: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.textSecondary,
  },

  // Section label
  sectionLabel: {
    ...typography.overline,
    marginBottom: spacing.sm,
  },

  // Date card
  dateCard: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.lg,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  dateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
  },
  dateValue: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
  },
  dateDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },

  // Export button
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: spacing.base,
  },
  exportButtonText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 16,
  },

  // Footer
  footerNote: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: spacing.lg,
  },
});
