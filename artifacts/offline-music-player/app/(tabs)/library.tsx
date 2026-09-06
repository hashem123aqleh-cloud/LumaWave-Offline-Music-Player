import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MusicArtwork } from '@/components/MusicArtwork';
import { NowPlayingBar } from '@/components/NowPlayingBar';
import { ScreenTransition } from '@/components/ScreenTransition';
import { useMusic } from '@/context/MusicContext';
import { useColors } from '@/hooks/useColors';

export default function LibraryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tracks, addTracks, playTrack, removeTrack, isLoading } = useMusic();

  const topInset = Math.max(insets.top, Platform.OS === 'web' ? 67 : 24);

  return (
    <ScreenTransition>
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <FlatList
        data={tracks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: topInset + 22, paddingBottom: 112 }}
        ListHeaderComponent={<View style={styles.header}><View><Text style={[styles.kicker, { color: colors.primary }]}>YOUR COLLECTION</Text><Text style={[styles.title, { color: colors.foreground }]}>Library</Text></View><Pressable onPress={() => void addTracks()} style={[styles.addButton, { backgroundColor: colors.primary }]}><Feather name="plus" size={20} color={colors.primaryForeground} /></Pressable></View>}
        ListEmptyComponent={!isLoading ? <View style={[styles.empty, { borderColor: colors.border, backgroundColor: colors.card }]}><View style={[styles.emptyIcon, { backgroundColor: colors.accent }]}><Feather name="music" size={22} color={colors.primary} /></View><Text style={[styles.emptyTitle, { color: colors.foreground }]}>Your music, your way</Text><Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Import MP3s from the Files app and they’ll stay available offline.</Text><Pressable onPress={() => void addTracks()} style={[styles.importButton, { backgroundColor: colors.foreground }]}><Text style={[styles.importButtonText, { color: colors.background }]}>Import MP3s</Text></Pressable></View> : null}
        renderItem={({ item, index }) => <Pressable onPress={() => { playTrack(item); router.push('/player'); }} onLongPress={() => removeTrack(item.id)} style={({ pressed }) => [styles.row, { borderBottomColor: colors.border, opacity: pressed ? 0.72 : 1 }]}><MusicArtwork coverKey={item.coverKey} size={55} style={styles.artwork} /><View style={styles.rowCopy}><Text style={[styles.rowTitle, { color: colors.foreground }]} numberOfLines={1}>{item.title}</Text><Text style={[styles.rowArtist, { color: colors.mutedForeground }]} numberOfLines={1}>{item.artist}</Text></View><Text style={[styles.index, { color: colors.mutedForeground }]}>{String(index + 1).padStart(2, '0')}</Text></Pressable>}
        />
        <NowPlayingBar onPress={() => router.push('/player')} />
      </View>
    </ScreenTransition>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  kicker: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.6 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 34, marginTop: 7 },
  addButton: { width: 45, height: 45, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  empty: { marginHorizontal: 20, borderRadius: 24, borderWidth: 1, padding: 24, alignItems: 'center', marginTop: 8 },
  emptyIcon: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  emptyTitle: { fontFamily: 'Inter_700Bold', fontSize: 19 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 14, textAlign: 'center', lineHeight: 21, marginTop: 9 },
  importButton: { paddingHorizontal: 20, paddingVertical: 13, borderRadius: 14, marginTop: 20 },
  importButtonText: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  row: { marginHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center' },
  artwork: { borderRadius: 14, shadowOpacity: 0 },
  rowCopy: { flex: 1, marginLeft: 14 },
  rowTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  rowArtist: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 6 },
  index: { fontFamily: 'Inter_600SemiBold', fontSize: 12, marginLeft: 10 },
});