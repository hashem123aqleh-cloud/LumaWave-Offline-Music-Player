import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { MusicArtwork } from '@/components/MusicArtwork';
import { useMusic } from '@/context/MusicContext';

export function NowPlayingBar({ onPress }: { onPress?: () => void }) {
  const colors = useColors();
  const { currentTrack, isPlaying, togglePlayback, skipForward } = useMusic();
  if (!currentTrack) return null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.9 : 1 }]}
    >
      <MusicArtwork coverKey={currentTrack.coverKey} size={46} style={styles.artwork} />
      <View style={styles.copy}>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>{currentTrack.title}</Text>
        <Text style={[styles.artist, { color: colors.mutedForeground }]} numberOfLines={1}>{currentTrack.artist}</Text>
      </View>
      <Pressable onPress={togglePlayback} hitSlop={12} style={styles.iconButton}>
        <Feather name={isPlaying ? 'pause' : 'play'} size={19} color={colors.foreground} />
      </Pressable>
      <Pressable onPress={skipForward} hitSlop={12} style={styles.iconButton}>
        <Feather name="skip-forward" size={19} color={colors.foreground} />
      </Pressable>
      <View style={[styles.progress, { backgroundColor: colors.primary }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { minHeight: 68, marginHorizontal: 16, marginBottom: 10, borderRadius: 18, borderWidth: 1, flexDirection: 'row', alignItems: 'center', padding: 10, overflow: 'hidden' },
  artwork: { borderRadius: 12, shadowOpacity: 0 },
  copy: { flex: 1, marginHorizontal: 12 },
  title: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  artist: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 3 },
  iconButton: { width: 34, height: 40, justifyContent: 'center', alignItems: 'center' },
  progress: { position: 'absolute', bottom: 0, left: 0, height: 2, width: '36%' },
});