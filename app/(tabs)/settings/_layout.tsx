import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../../src/theme/tokens';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bgDeep },
        animation: 'slide_from_right',
      }}
    />
  );
}
