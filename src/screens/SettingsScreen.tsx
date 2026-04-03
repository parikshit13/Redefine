import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth, useUser } from '@clerk/clerk-expo';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing } from '../theme/tokens';
import GlassCard from '../components/GlassCard';
import { useToast } from '../components/Toast';

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

// Row icons (22x22, stroke only)
function UserIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function BellIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function MoonIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function DownloadIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M7 10l5 5 5-5" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 15V3" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function LogOutIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16 17l5-5-5-5" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M21 12H9" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const ROWS = [
  { label: 'Profile', Icon: UserIcon, color: colors.sage },
  { label: 'Notifications', Icon: BellIcon, color: colors.lavender },
  { label: 'Theme', Icon: MoonIcon, color: colors.peach },
  { label: 'Export data', Icon: DownloadIcon, color: colors.sky },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const { user } = useUser();
  const toast = useToast();

  const email = user?.emailAddresses?.[0]?.emailAddress ?? '';
  const fullName = user?.fullName ?? '';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[typography.displayMedium, styles.title]}>Settings</Text>

      {/* User info */}
      <GlassCard style={styles.profileCard}>
        <View style={styles.profileRow}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>
              {(fullName || email).charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            {fullName ? <Text style={styles.profileName}>{fullName}</Text> : null}
            <Text style={styles.profileEmail}>{email}</Text>
          </View>
        </View>
      </GlassCard>

      {/* Settings rows */}
      <GlassCard style={styles.card}>
        {ROWS.map(({ label, Icon, color }, i) => (
          <View
            key={label}
            style={[styles.row, i < ROWS.length - 1 && styles.rowBorder]}
          >
            <View style={[styles.iconBox, { backgroundColor: `${color}1F` }]}>
              <Icon color={color} />
            </View>
            <Text style={styles.rowLabel}>{label}</Text>
            <ChevronRight />
          </View>
        ))}
      </GlassCard>

      {/* Sign out */}
      <Pressable onPress={() => signOut().catch(() => toast.show('Failed to sign out'))} style={styles.signOutButton}>
        <View style={[styles.iconBox, { backgroundColor: 'rgba(204,155,175,0.12)' }]}>
          <LogOutIcon color={colors.rose} />
        </View>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
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
    paddingBottom: spacing.xxl,
  },
  title: {
    marginBottom: spacing.lg,
  },

  // Profile
  profileCard: {
    padding: spacing.base,
    marginBottom: spacing.base,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(139,175,139,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 20,
    color: colors.sage,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  profileEmail: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.textSecondary,
  },

  // Settings rows
  card: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    ...typography.sectionTitle,
    flex: 1,
  },

  // Sign out
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: spacing.base,
  },
  signOutText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    color: colors.rose,
  },
});
