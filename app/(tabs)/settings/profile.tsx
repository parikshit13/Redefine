import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUser, useAuth } from '@clerk/clerk-expo';
import Svg, { Path, Line } from 'react-native-svg';
import { colors, typography, spacing, glassRecessed } from '../../../src/theme/tokens';
import GlassCard from '../../../src/components/GlassCard';
import SettingsHeader from '../../../src/components/SettingsHeader';
import { useToast } from '../../../src/components/Toast';
import { useAccent } from '../../../src/context/ThemeContext';

function EyeIcon({ open }: { open: boolean }) {
  const stroke = 'rgba(255,255,255,0.32)';
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 15a3 3 0 100-6 3 3 0 000 6z"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {!open && (
        <Line
          x1={3}
          y1={21}
          x2={21}
          y2={3}
          stroke={stroke}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      )}
    </Svg>
  );
}

function ChevronRight() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18l6-6-6-6"
        stroke={colors.textMuted}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function PasswordInput({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
}) {
  const { accent } = useAccent();
  const [show, setShow] = useState(false);
  return (
    <View style={styles.passwordWrapper}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        secureTextEntry={!show}
        style={[styles.textInput, { paddingRight: 48 }]}
        selectionColor={accent.hex}
      />
      <Pressable
        onPress={() => setShow((v) => !v)}
        style={styles.eyeButton}
        hitSlop={8}
      >
        <EyeIcon open={show} />
      </Pressable>
    </View>
  );
}

function ChangePasswordModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { user } = useUser();
  const toast = useToast();
  const { accent } = useAccent();
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      setError('');
    }
  }, [visible]);

  const handleSubmit = async () => {
    setError('');
    if (!currentPw || !newPw || !confirmPw) {
      setError('All fields are required');
      return;
    }
    if (newPw !== confirmPw) {
      setError('New passwords do not match');
      return;
    }
    if (newPw.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await user?.updatePassword({
        currentPassword: currentPw,
        newPassword: newPw,
      });
      toast.show('Password updated');
      onClose();
    } catch (err: any) {
      const msg =
        err?.errors?.[0]?.longMessage || err?.message || 'Failed to update password';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalCenter}
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>CHANGE PASSWORD</Text>

            <View style={styles.modalField}>
              <Text style={styles.fieldLabel}>CURRENT PASSWORD</Text>
              <PasswordInput
                value={currentPw}
                onChangeText={setCurrentPw}
                placeholder="Enter current password"
              />
            </View>

            <View style={styles.modalField}>
              <Text style={styles.fieldLabel}>NEW PASSWORD</Text>
              <PasswordInput
                value={newPw}
                onChangeText={setNewPw}
                placeholder="Enter new password"
              />
            </View>

            <View style={styles.modalField}>
              <Text style={styles.fieldLabel}>CONFIRM NEW PASSWORD</Text>
              <PasswordInput
                value={confirmPw}
                onChangeText={setConfirmPw}
                placeholder="Confirm new password"
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.modalActions}>
              <Pressable onPress={onClose} style={styles.modalCancel}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSubmit}
                disabled={loading}
                style={[styles.modalSave, { backgroundColor: accent.dim, borderColor: accent.border }, loading && { opacity: 0.6 }]}
              >
                {loading ? (
                  <ActivityIndicator color={accent.hex} size="small" />
                ) : (
                  <Text style={[styles.modalSaveText, { color: accent.hex }]}>Update</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useAuth();
  const toast = useToast();
  const { accent } = useAccent();

  const [nameValue, setNameValue] = useState(user?.fullName ?? '');
  const [savingName, setSavingName] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  useEffect(() => {
    if (user?.fullName) setNameValue(user.fullName);
  }, [user?.fullName]);

  const handleNameBlur = async () => {
    const trimmed = nameValue.trim();
    if (!trimmed || trimmed === user?.fullName) return;
    setSavingName(true);
    try {
      const parts = trimmed.split(' ');
      await user?.update({
        firstName: parts[0],
        lastName: parts.slice(1).join(' ') || undefined,
      });
    } catch (err: any) {
      toast.show(err?.message || 'Failed to update name');
      setNameValue(user?.fullName ?? '');
    } finally {
      setSavingName(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'This action is permanent and cannot be undone. All your data will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await user?.delete();
              router.replace('/(auth)/sign-in');
            } catch (err: any) {
              toast.show(err?.message || 'Failed to delete account');
            }
          },
        },
      ],
    );
  };

  const email = user?.emailAddresses?.[0]?.emailAddress ?? '';
  const initial = (user?.fullName || email).charAt(0).toUpperCase();
  const joinDate = user?.createdAt ? formatDate(new Date(user.createdAt)) : '';

  return (
    <View style={styles.screen}>
      <SettingsHeader title="Profile" />
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, { backgroundColor: accent.dim }]}>
          <Text style={[styles.avatarLetter, { color: accent.hex }]}>{initial}</Text>
        </View>
      </View>

      {/* Name field */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>NAME</Text>
        <View style={styles.nameInputRow}>
          <TextInput
            value={nameValue}
            onChangeText={setNameValue}
            onBlur={handleNameBlur}
            onSubmitEditing={handleNameBlur}
            returnKeyType="done"
            placeholder="Your name"
            placeholderTextColor={colors.textMuted}
            style={[styles.textInput, { flex: 1 }]}
            selectionColor={accent.hex}
          />
          {savingName && (
            <ActivityIndicator
              color={accent.hex}
              size="small"
              style={styles.nameSaving}
            />
          )}
        </View>
      </View>

      {/* Email field */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>EMAIL</Text>
        <View style={styles.emailDisplay}>
          <Text style={styles.emailText}>{email}</Text>
        </View>
      </View>

      {/* Change password */}
      <View style={styles.fieldGroup}>
        <Pressable onPress={() => setPasswordModalVisible(true)}>
          <GlassCard style={styles.actionRow}>
            <Text style={styles.actionRowText}>Change password</Text>
            <ChevronRight />
          </GlassCard>
        </Pressable>
      </View>

      {/* Account created */}
      {joinDate ? (
        <View style={styles.fieldGroup}>
          <GlassCard style={styles.actionRow}>
            <Text style={styles.actionRowLabel}>Account created</Text>
            <Text style={styles.actionRowDate}>{joinDate}</Text>
          </GlassCard>
        </View>
      ) : null}

      {/* Delete account */}
      <Pressable onPress={handleDeleteAccount} style={styles.deleteButton}>
        <Text style={styles.deleteText}>Delete account</Text>
      </Pressable>

      <ChangePasswordModal
        visible={passwordModalVisible}
        onClose={() => setPasswordModalVisible(false)}
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

  // Avatar
  avatarContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 28,
  },

  // Fields
  fieldGroup: {
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    ...typography.overline,
    marginBottom: spacing.sm,
  },
  textInput: {
    ...glassRecessed,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: colors.textPrimary,
  },
  nameInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameSaving: {
    marginLeft: 10,
  },

  // Email
  emailDisplay: {
    ...glassRecessed,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  emailText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: colors.textSecondary,
  },

  // Action rows
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.base,
  },
  actionRowText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    color: colors.textPrimary,
  },
  actionRowLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
  },
  actionRowDate: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: colors.textPrimary,
  },

  // Delete
  deleteButton: {
    alignItems: 'center',
    paddingVertical: spacing.base,
    marginTop: spacing.lg,
  },
  deleteText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: colors.rose,
  },

  // Password wrapper
  passwordWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Error
  errorText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.rose,
    marginBottom: spacing.base,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCenter: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
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
  modalField: {
    marginBottom: spacing.base,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: spacing.sm,
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
