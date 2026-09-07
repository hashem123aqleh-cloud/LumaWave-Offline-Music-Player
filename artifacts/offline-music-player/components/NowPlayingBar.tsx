import { Feather } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { MusicArtwork } from '@/components/MusicArtwork';
import { useMusic } from '@/context/MusicContext';

export function NowPlayingBar({ onPress }: { onPress?: () => void }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentTrack, isPlaying, togglePlayback, skipForward, progress, duration } = useMusic();
  if (!currentTrack) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border, bottom: Platform.OS === 'web' ? 84 : Math.max(84, insets.bottom + 54) }]}>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.mainContent, { opacity: pressed ? 0.72 : 1 }]}>
        <MusicArtwork coverKey={currentTrack.coverKey} artworkUri={currentTrack.artworkUri} size={46} style={styles.artwork} />
        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>{currentTrack.title}</Text>
          <Text style={[styles.artist, { color: colors.mutedForeground }]} numberOfLines={1}>{currentTrack.artist}</Text>
        </View>
      </Pressable>
      <Pressable onPress={togglePlayback} hitSlop={12} style={styles.iconButton}>
        <Feather name={isPlaying ? 'pause' : 'play'} size={19} color={colors.foreground} />
      </Pressable>
      <Pressable onPress={skipForward} hitSlop={12} style={styles.iconButton}>
        <Feather name="skip-forward" size={19} color={colors.foreground} />
      </Pressable>
      <View style={[styles.progress, { backgroundColor: colors.primary, width: duration ? `${Math.min(100, (progress / duration) * 100)}%` : '0%' }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', left: 16, right: 16, minHeight: 68, borderRadius: 18, borderWidth: 1, flexDirection: 'row', alignItems: 'center', padding: 10, overflow: 'hidden', zIndex: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.28, shadowRadius: 16, elevation: 8 },
  mainContent: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  artwork: { borderRadius: 12, shadowOpacity: 0 },
  copy: { flex: 1, marginHorizontal: 12 },
  title: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  artist: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 3 },
  iconButton: { width: 34, height: 40, justifyContent: 'center', alignItems: 'center' },
  progress: { position: 'absolute', bottom: 0, left: 0, height: 2, width: '36%' },
});