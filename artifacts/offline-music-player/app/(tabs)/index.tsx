import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MusicArtwork } from '@/components/MusicArtwork';
import { ScreenTransition } from '@/components/ScreenTransition';
import { useMusic } from '@/context/MusicContext';
import { useColors } from '@/hooks/useColors';

function MusicOrb({ colors, onPress }: { colors: ReturnType<typeof useColors>; onPress: () => void }) {
  const { width } = useWindowDimensions();
  const orbSize = Math.min(Math.max(width - 40, 260), 330);
  const noteScale = useSharedValue(1);
  const waveOne = useSharedValue(0);
  const waveTwo = useSharedValue(0);
  const waveThree = useSharedValue(0);

  useEffect(() => {
    noteScale.value = withRepeat(
      withSequence(
        withTiming(1.07, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
    const wave = (delay: number) => withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 2200, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 0 }),
        ),
        -1,
        false,
      ),
    );
    waveOne.value = wave(0);
    waveTwo.value = wave(720);
    waveThree.value = wave(1440);
  }, [noteScale, waveOne, waveTwo, waveThree]);

  const noteStyle = useAnimatedStyle(() => ({ transform: [{ scale: noteScale.value }] }));
  const waveOneStyle = useAnimatedStyle(() => ({ opacity: 0.24 * (1 - waveOne.value), transform: [{ scale: 1 + waveOne.value * 0.62 }] }));
  const waveTwoStyle = useAnimatedStyle(() => ({ opacity: 0.24 * (1 - waveTwo.value), transform: [{ scale: 1 + waveTwo.value * 0.62 }] }));
  const waveThreeStyle = useAnimatedStyle(() => ({ opacity: 0.24 * (1 - waveThree.value), transform: [{ scale: 1 + waveThree.value * 0.62 }] }));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Open your music library"
      style={({ pressed }) => [styles.orbHero, { width: orbSize, height: orbSize, borderRadius: orbSize / 2, backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.86 : 1 }]}
    >
      <LinearGradient colors={[colors.accent, colors.background]} start={{ x: 0.15, y: 0 }} end={{ x: 0.85, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={styles.orbContent}>
        <View style={[styles.waveField, { pointerEvents: 'none' }]}>
          <Animated.View style={[styles.waveRing, { borderColor: colors.highlight }, waveOneStyle]} />
          <Animated.View style={[styles.waveRing, { borderColor: colors.primary }, waveTwoStyle]} />
          <Animated.View style={[styles.waveRing, { borderColor: colors.highlight }, waveThreeStyle]} />
          <View style={[styles.orbGlow, { backgroundColor: colors.primary }]} />
          <Animated.View style={[styles.orbCore, { backgroundColor: colors.foreground }, noteStyle]}>
            <Feather name="music" size={62} color={colors.background} />
          </Animated.View>
        </View>
        <Text style={[styles.orbTitle, { color: colors.foreground }]}>Open your library</Text>
        <Text style={[styles.orbCopy, { color: colors.accentForeground }]}>Tap to browse your offline collection</Text>
      </View>
    </Pressable>
  );
}

function getGreeting(hour: number) {
  if (hour < 5) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tracks, playTrack } = useMusic();
  const recent = tracks.slice(0, 3);
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());

  const topInset = Math.max(insets.top, Platform.OS === 'web' ? 67 : 24);

  useEffect(() => {
    const clock = setInterval(() => setCurrentHour(new Date().getHours()), 60_000);
    return () => clearInterval(clock);
  }, []);

  return (
    <ScreenTransition>
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={{ paddingTop: topInset + 18, paddingBottom: 112 }} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}><Text style={[styles.greeting, { color: colors.mutedForeground }]}>YOUR SOUNDTRACK</Text><Text style={[styles.title, { color: colors.foreground }]}>{getGreeting(currentHour)}</Text></View>
        <MusicOrb colors={colors} onPress={() => router.push('/(tabs)/library')} />
        <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recently added</Text><Pressable onPress={() => router.push('/(tabs)/library')}><Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text></Pressable></View>
        {recent.length === 0 ? <View style={[styles.emptyRow, { borderColor: colors.border, backgroundColor: colors.card }]}><Feather name="music" size={18} color={colors.mutedForeground} /><Text style={[styles.emptyRowText, { color: colors.mutedForeground }]}>Import a few MP3s to see them here.</Text></View> : recent.map((track) => <Pressable key={track.id} onPress={() => { playTrack(track); router.push('/player'); }} style={({ pressed }) => [styles.trackRow, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}><MusicArtwork coverKey={track.coverKey} size={52} style={styles.trackArt} /><View style={styles.trackCopy}><Text style={[styles.trackTitle, { color: colors.foreground }]} numberOfLines={1}>{track.title}</Text><Text style={[styles.trackArtist, { color: colors.mutedForeground }]} numberOfLines={1}>{track.artist}</Text></View><Feather name="play-circle" size={23} color={colors.primary} /></Pressable>)}
        <View style={[styles.tip, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.tipIcon, { backgroundColor: colors.accent }]}><Feather name="headphones" size={17} color={colors.primary} /></View><View style={{ flex: 1 }}><Text style={[styles.tipTitle, { color: colors.foreground }]}>Made for your pocket</Text><Text style={[styles.tipCopy, { color: colors.mutedForeground }]}>Playback keeps going with your screen locked.</Text></View></View>
        </ScrollView>
      </View>
    </ScreenTransition>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: { paddingHorizontal: 20, alignItems: 'center' },
  greeting: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.7 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 28, marginTop: 8 },
  orbHero: { alignSelf: 'center', marginTop: 26, overflow: 'hidden', borderWidth: 1 },
  orbContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 22 },
  waveField: { width: 196, height: 196, alignItems: 'center', justifyContent: 'center' },
  waveRing: { position: 'absolute', width: 146, height: 146, borderRadius: 73, borderWidth: 2 },
  orbGlow: { position: 'absolute', width: 132, height: 132, borderRadius: 66, opacity: 0.18 },
  orbCore: { width: 116, height: 116, borderRadius: 40, alignItems: 'center', justifyContent: 'center', paddingLeft: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.26, shadowRadius: 18, elevation: 8 },
  orbTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, marginTop: 14 },
  orbCopy: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 6 },
  sectionHeader: { marginHorizontal: 20, marginTop: 30, marginBottom: 13, alignItems: 'center' },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  seeAll: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  emptyRow: { marginHorizontal: 20, borderWidth: 1, borderRadius: 999, padding: 18, flexDirection: 'row', gap: 10, alignItems: 'center' },
  emptyRowText: { fontFamily: 'Inter_400Regular', fontSize: 13 },
  trackRow: { marginHorizontal: 20, marginBottom: 10, borderWidth: 1, borderRadius: 24, flexDirection: 'row', alignItems: 'center', padding: 9 },
  trackArt: { borderRadius: 14, shadowOpacity: 0 },
  trackCopy: { flex: 1, marginHorizontal: 13 },
  trackTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  trackArtist: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 5 },
  tip: { marginHorizontal: 20, borderRadius: 999, borderWidth: 1, padding: 12, flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 28 },
  tipIcon: { width: 39, height: 39, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  tipTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  tipCopy: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 },
});
