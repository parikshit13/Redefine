import React from 'react';
import { View, ViewStyle, StyleSheet, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, glassSurface, radii } from '../theme/tokens';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  accentColor?: string;
  borderRadius?: number;
}

export default function GlassCard({
  children,
  style,
  accentColor,
  borderRadius = radii.md,
}: GlassCardProps) {
  const highlightColor = accentColor
    ? `${accentColor}33` // ~20% opacity
    : 'rgba(255,255,255,0.08)';

  return (
    <View
      style={[
        glassSurface,
        { borderRadius },
        accentColor && {
          backgroundColor: `${accentColor}14`, // ~8% opacity
          borderColor: `${accentColor}1F`, // ~12% opacity
        },
        style,
      ]}
    >
      <LinearGradient
        colors={['transparent', highlightColor, 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.highlight, { borderTopLeftRadius: borderRadius, borderTopRightRadius: borderRadius }]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    zIndex: 1,
  },
});
