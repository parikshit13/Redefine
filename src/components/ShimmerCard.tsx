import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { colors, spacing, glassSurface } from '../theme/tokens';

interface ShimmerCardProps {
  count?: number;
}

function ShimmerRow() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Animated.View style={[styles.iconPlaceholder, { opacity }]} />
        <View style={styles.info}>
          <Animated.View style={[styles.namePlaceholder, { opacity }]} />
          <Animated.View style={[styles.metaPlaceholder, { opacity }]} />
        </View>
        <Animated.View style={[styles.checkPlaceholder, { opacity }]} />
      </View>
    </View>
  );
}

export default function ShimmerCard({ count = 3 }: ShimmerCardProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, i) => (
        <ShimmerRow key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  card: {
    ...glassSurface,
    padding: spacing.base,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  info: {
    flex: 1,
    gap: 8,
  },
  namePlaceholder: {
    width: '60%',
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  metaPlaceholder: {
    width: '40%',
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  checkPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
});
