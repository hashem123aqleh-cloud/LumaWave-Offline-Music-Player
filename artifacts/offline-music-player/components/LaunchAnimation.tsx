import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { AccessibilityInfo, Image, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { useColors } from '@/hooks/useColors';

const icon = require('@/assets/images/icon.png');

export function LaunchAnimation({ onFinish }: { onFinish: () => void }) {
  const colors = useColors();
  const opacity = useSharedValue(1);
  const markScale = useSharedValue(0.82);
  const markOpacity = useSharedValue(0);
  const glowScale = useSharedValue(0.72);
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion === null) return;
    if (reduceMotion) {
      opacity.value = 0;
      const finishTimer = setTimeout(onFinish, 80);
      return () => clearTimeout(finishTimer);
    }
    markOpacity.value = withDelay(120, withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }));
    markScale.value = withDelay(120, withSequence(
      withTiming(1.06, { duration: 520, easing: Easing.out(Easing.back(1.3)) }),
      withTiming(1, { duration: 220, easing: Easing.out(Easing.cubic) }),
    ));
    glowScale.value = withSequence(
      withTiming(1.22, { duration: 900, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 300 }),
    );
    const fadeTimer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
    }, 860);
    const finishTimer = setTimeout(onFinish, 1180);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [glowScale, markOpacity, markScale, onFinish, opacity, reduceMotion]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const markStyle = useAnimatedStyle(() => ({ opacity: markOpacity.value, transform: [{ scale: markScale.value }] }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: markOpacity.value * 0.38, transform: [{ scale: glowScale.value }] }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.overlay, overlayStyle]}>
      <LinearGradient colors={[colors.background, colors.accent, colors.background]} locations={[0, 0.48, 1]} style={StyleSheet.absoluteFill} />
      <View style={styles.center}>
        <Animated.View style={[styles.glow, { backgroundColor: colors.highlight }, glowStyle]} />
        <Animated.View style={[styles.markWrap, markStyle]}>
          <Image source={icon} style={styles.mark} />
        </Animated.View>
        <Animated.View style={styles.copy}>
          <Text style={[styles.name, { color: colors.foreground }]}>LumaWave</Text>
          <Text style={[styles.tagline, { color: colors.accentForeground }]}>YOUR MUSIC. YOUR MOMENT.</Text>
        </Animated.View>
      </View>
      <View style={styles.bottomNote}><View style={[styles.dot, { backgroundColor: colors.highlight }]} /><Text style={[styles.offline, { color: colors.mutedForeground }]}>OFFLINE BY DESIGN</Text></View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: { zIndex: 100, backgroundColor: '#0B0C14', alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', width: 152, height: 152, borderRadius: 76 },
  markWrap: { width: 112, height: 112, borderRadius: 34, overflow: 'hidden' },
  mark: { width: '100%', height: '100%' },
  copy: { alignItems: 'center', marginTop: 22 },
  name: { fontFamily: 'Inter_700Bold', fontSize: 30, letterSpacing: -0.7 },
  tagline: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 2.1, marginTop: 8 },
  bottomNote: { position: 'absolute', bottom: 42, flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  offline: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.5 },
});