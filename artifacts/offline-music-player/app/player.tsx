import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MusicArtwork } from '@/components/MusicArtwork';
import { useColors } from '@/hooks/useColors';
import { useMusic } from '@/context/MusicContext';

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return '0:00';
  return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
}

export default function PlayerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentTrack, isPlaying, togglePlayback, skipForward, skipBack, progress, duration, seekTo } = useMusic();

  if (!currentTrack) {
    return <View style={[styles.empty, { backgroundColor: colors.background }]}><Text style={{ color: colors.mutedForeground }}>Add a track to start listening.</Text></View>;
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.headerButton}><Feather name="chevron-down" size={25} color={colors.foreground} /></Pressable>
        <Text style={[styles.headerLabel, { color: colors.mutedForeground }]}>NOW PLAYING</Text>
        <Pressable style={styles.headerButton}><Feather name="more-horizontal" size={24} color={colors.foreground} /></Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <MusicArtwork coverKey={currentTrack.coverKey} size={318} style={styles.largeArt} />
        <View style={styles.trackInfo}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.trackTitle, { color: colors.foreground }]} numberOfLines={1}>{currentTrack.title}</Text>
            <Text style={[styles.trackArtist, { color: colors.mutedForeground }]}>{currentTrack.artist}</Text>
          </View>
          <Pressable hitSlop={12}><Feather name="heart" size={23} color={colors.foreground} /></Pressable>
        </View>
        <View style={styles.timeline}>
          <View style={[styles.trackBar, { backgroundColor: colors.secondary }]}>
            <View style={[styles.trackFill, { backgroundColor: colors.primary, width: `${duration ? (progress / duration) * 100 : 0}%` }]} />
          </View>
          <View style={styles.timeRow}><Text style={[styles.time, { color: colors.mutedForeground }]}>{formatTime(progress)}</Text><Text style={[styles.time, { color: colors.mutedForeground }]}>{formatTime(duration)}</Text></View>
        </View>
        <View style={styles.controls}>
          <Pressable onPress={skipBack} hitSlop={14}><Feather name="skip-back" size={27} color={colors.foreground} /></Pressable>
          <Pressable onPress={() => void seekTo(Math.max(0, progress - 10))} hitSlop={14}><Feather name="rotate-ccw" size={20} color={colors.mutedForeground} /></Pressable>
          <Pressable onPress={togglePlayback} style={[styles.playButton, { backgroundColor: colors.foreground }]}><Feather name={isPlaying ? 'pause' : 'play'} size={28} color={colors.background} /></Pressable>
          <Pressable onPress={() => void seekTo(Math.min(duration, progress + 10))} hitSlop={14}><Feather name="rotate-cw" size={20} color={colors.mutedForeground} /></Pressable>
          <Pressable onPress={skipForward} hitSlop={14}><Feather name="skip-forward" size={27} color={colors.foreground} /></Pressable>
        </View>
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="download-cloud" size={17} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>Available offline on this iPhone</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { minHeight: 76, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerButton: { width: 40, alignItems: 'center' },
  headerLabel: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.5 },
  content: { alignItems: 'center', paddingHorizontal: 28, paddingTop: 26, paddingBottom: 36 },
  largeArt: { borderRadius: 26 },
  trackInfo: { width: '100%', flexDirection: 'row', alignItems: 'center', marginTop: 28 },
  trackTitle: { fontFamily: 'Inter_700Bold', fontSize: 22 },
  trackArtist: { fontFamily: 'Inter_500Medium', fontSize: 15, marginTop: 7 },
  timeline: { width: '100%', marginTop: 30 },
  trackBar: { height: 5, borderRadius: 5, overflow: 'hidden' },
  trackFill: { height: '100%', borderRadius: 5 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  time: { fontFamily: 'Inter_400Regular', fontSize: 11 },
  controls: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 25 },
  playButton: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', paddingLeft: 3 },
  infoCard: { width: '100%', borderRadius: 16, borderWidth: 1, flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center', paddingVertical: 13, marginTop: 34 },
  infoText: { fontFamily: 'Inter_500Medium', fontSize: 12 },
});