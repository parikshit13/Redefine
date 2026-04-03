import React, { useEffect, useRef, useCallback, useState, createContext, useContext } from 'react';
import { Text, Animated, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme/tokens';

interface ToastContextType {
  show: (message: string) => void;
}

const ToastContext = createContext<ToastContextType>({ show: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const show = useCallback((msg: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setMessage(msg);
    setVisible(true);

    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();

    timeoutRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 20, duration: 300, useNativeDriver: true }),
      ]).start(() => setVisible(false));
    }, 3000);
  }, [opacity, translateY]);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {visible && (
        <Animated.View
          style={[
            styles.toast,
            {
              bottom: insets.bottom + 90,
              opacity,
              transform: [{ translateY }],
            },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.text} numberOfLines={2}>{message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: 'rgba(204,155,175,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(204,155,175,0.25)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    zIndex: 9999,
  },
  text: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.rose,
    textAlign: 'center',
  },
});
