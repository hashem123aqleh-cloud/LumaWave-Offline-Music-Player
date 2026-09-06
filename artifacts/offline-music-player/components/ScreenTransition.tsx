import { PropsWithChildren, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export function ScreenTransition({ children }: PropsWithChildren) {
  const progress = useSharedValue(1);

  useFocusEffect(useCallback(() => {
    progress.value = 0;
    progress.value = withTiming(1, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });
    return () => {
      progress.value = withTiming(0, { duration: 140 });
    };
  }, [progress]));

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 10 }],
  }));

  return <Animated.View style={[{ flex: 1 }, animatedStyle]}>{children}</Animated.View>;
}