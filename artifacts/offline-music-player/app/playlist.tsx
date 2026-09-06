import { Feather } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MusicArtwork } from '@/components/MusicArtwork';
import { PlaylistEditorModal } from '@/components/PlaylistEditorModal';
import { ScreenTransition } from '@/components/ScreenTransition';
import { Track, useMusic } from '@/context/MusicContext';
import { useColors } from '@/hooks/useColors';

export default function PlaylistScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [showEditor, setShowEditor] = useState(false);
  const [showAddSongs, setShowAddSongs] = useState(false);
  const { tracks, playlists, playTrack, updatePlaylist, deletePlaylist, setPlaylistTracks } = useMusic();
  const playlist = playlists.find((item) => item.id === id);
  const [selectedIds, setSelectedIds] = useState<string[]>(playlist?.trackIds ?? []);
  const topInset = Math.max(insets.top, Platform.OS === 'web' ? 67 : 24);

  const playlistTracks = useMemo(
    () => playlist?.trackIds.map((trackId) => tracks.find((track) => track.id === trackId)).filter((track): track is Track => Boolean(track)) ?? [],
    [playlist, tracks],
  );

  if (!playlist) {
    return <View style={[styles.emptyScreen, { backgroundColor: colors.background }]}><Text style={[styles.emptyText, { color: colors.mutedForeground }]}>This playlist is no longer available.</Text></View>;
  }

  const openAddSongs = () => {
    setSelectedIds(playlist.trackIds);
    setShowAddSongs(true);
  };

  const saveSongs = async () => {
    await setPlaylistTracks(playlist.id, selectedIds);
    setShowAddSongs(false);
  };

  const deleteCurrentPlaylist = async () => {
    await deletePlaylist(playlist.id);
    router.back();
  };

  return (
    <ScreenTransition>
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.header, { paddingTop: topInset + 8 }]}>
          <Pressable onPress={() => router.back()} style={styles.headerButton}><Feather name="chevron-left" size={25} color={colors.foreground} /></Pressable>
          <Text style={[styles.headerLabel, { color: colors.mutedForeground }]}>PLAYLIST</Text>
          <Pressable onPress={() => setShowEditor(true)} style={styles.headerButton}><Feather name="edit-3" size={19} color={colors.foreground} /></Pressable>
        </View>
        <FlatList
          data={playlistTracks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.content}
          ListHeaderComponent={
            <View>
              <View style={styles.hero}>
                <MusicArtwork coverKey={playlist.coverKey} size={128} style={styles.heroArt} />
                <View style={styles.heroCopy}><Text style={[styles.title, { color: colors.foreground }]}>{playlist.name}</Text><Text style={[styles.description, { color: colors.mutedForeground }]}>{playlist.description || 'A playlist made for your moments.'}</Text><Text style={[styles.count, { color: colors.primary }]}>{playlistTracks.length} {playlistTracks.length === 1 ? 'song' : 'songs'}</Text></View>
              </View>
              <View style={styles.actionRow}>
                <Pressable onPress={() => playlistTracks[0] && playTrack(playlistTracks[0])} style={[styles.playAll, { backgroundColor: colors.primary }]}><Feather name="play" size={17} color={colors.primaryForeground} /><Text style={[styles.playAllText, { color: colors.primaryForeground }]}>Play playlist</Text></Pressable>
                <Pressable onPress={openAddSongs} style={[styles.addSongs, { backgroundColor: colors.secondary }]}><Feather name="plus" size={18} color={colors.foreground} /><Text style={[styles.addSongsText, { color: colors.foreground }]}>Add songs</Text></Pressable>
              </View>
              <View style={styles.songsHeader}><Text style={[styles.songsTitle, { color: colors.foreground }]}>Songs</Text><Text style={[styles.songsCount, { color: colors.mutedForeground }]}>{playlistTracks.length}</Text></View>
            </View>
          }
          ListEmptyComponent={<View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}><Feather name="music" size={22} color={colors.primary} /><Text style={[styles.emptyCardTitle, { color: colors.foreground }]}>This playlist is ready for its first song</Text><Text style={[styles.emptyCardCopy, { color: colors.mutedForeground }]}>Add tracks from your library whenever inspiration strikes.</Text><Pressable onPress={openAddSongs} style={[styles.emptyAdd, { backgroundColor: colors.foreground }]}><Text style={[styles.emptyAddText, { color: colors.background }]}>Choose songs</Text></Pressable></View>}
          renderItem={({ item, index }) => <Pressable onPress={() => playTrack(item)} onLongPress={() => void setPlaylistTracks(playlist.id, playlist.trackIds.filter((trackId) => trackId !== item.id))} style={({ pressed }) => [styles.row, { borderBottomColor: colors.border, opacity: pressed ? 0.72 : 1 }]}><MusicArtwork coverKey={item.coverKey} size={54} style={styles.trackArt} /><View style={styles.trackCopy}><Text style={[styles.trackTitle, { color: colors.foreground }]} numberOfLines={1}>{item.title}</Text><Text style={[styles.trackArtist, { color: colors.mutedForeground }]} numberOfLines={1}>{item.artist}</Text></View><Text style={[styles.index, { color: colors.mutedForeground }]}>{String(index + 1).padStart(2, '0')}</Text></Pressable>}
        />
        <Pressable onPress={() => void deleteCurrentPlaylist()} style={styles.deleteButton}><Feather name="trash-2" size={15} color={colors.destructive} /><Text style={[styles.deleteText, { color: colors.destructive }]}>Delete playlist</Text></Pressable>
        <PlaylistEditorModal visible={showEditor} title="Edit playlist" saveLabel="Save changes" initialName={playlist.name} initialDescription={playlist.description} initialCoverKey={playlist.coverKey} onClose={() => setShowEditor(false)} onSave={(name, description, coverKey) => { void updatePlaylist(playlist.id, { name, description, coverKey }); setShowEditor(false); }} />
        <AddSongsModal visible={showAddSongs} tracks={tracks} selectedIds={selectedIds} onToggle={(trackId) => setSelectedIds((current) => current.includes(trackId) ? current.filter((id) => id !== trackId) : [...current, trackId])} onClose={() => setShowAddSongs(false)} onSave={() => void saveSongs()} />
      </View>
    </ScreenTransition>
  );
}

function AddSongsModal({ visible, tracks, selectedIds, onToggle, onClose, onSave }: { visible: boolean; tracks: Track[]; selectedIds: string[]; onToggle: (id: string) => void; onClose: () => void; onSave: () => void }) {
  const colors = useColors();
  return (
    <View pointerEvents={visible ? 'auto' : 'none'} style={[styles.modalLayer, { opacity: visible ? 1 : 0 }]}>
      <View style={[styles.modalSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.modalHeader}><Text style={[styles.modalTitle, { color: colors.foreground }]}>Choose songs</Text><Pressable onPress={onClose} hitSlop={12}><Feather name="x" size={21} color={colors.mutedForeground} /></Pressable></View>
        <FlatList data={tracks} keyExtractor={(item) => item.id} style={styles.chooseList} keyboardShouldPersistTaps="handled" renderItem={({ item }) => { const selected = selectedIds.includes(item.id); return <Pressable onPress={() => onToggle(item.id)} style={[styles.chooseRow, { borderBottomColor: colors.border }]}><MusicArtwork coverKey={item.coverKey} size={43} style={styles.chooseArt} /><View style={styles.chooseCopy}><Text style={[styles.chooseTitle, { color: colors.foreground }]} numberOfLines={1}>{item.title}</Text><Text style={[styles.chooseArtist, { color: colors.mutedForeground }]}>{item.artist}</Text></View><View style={[styles.checkbox, { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.primary : 'transparent' }]}>{selected ? <Feather name="check" size={14} color={colors.primaryForeground} /> : null}</View></Pressable>; }} ListEmptyComponent={<Text style={[styles.noTracks, { color: colors.mutedForeground }]}>Import songs into your Library first.</Text>} />
        <Pressable onPress={onSave} style={[styles.saveSongs, { backgroundColor: colors.primary }]}><Text style={[styles.saveSongsText, { color: colors.primaryForeground }]}>Save playlist</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  emptyScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 14 },
  header: { minHeight: 76, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerButton: { width: 40, alignItems: 'center' },
  headerLabel: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.5 },
  content: { paddingHorizontal: 20, paddingBottom: 36 },
  hero: { flexDirection: 'row', alignItems: 'center', marginTop: 24 },
  heroArt: { borderRadius: 22 },
  heroCopy: { flex: 1, marginLeft: 18 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 26 },
  description: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, marginTop: 8 },
  count: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.7, marginTop: 12 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 28 },
  playAll: { flex: 1, minHeight: 50, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  playAllText: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  addSongs: { flex: 1, minHeight: 50, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  addSongsText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  songsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 31, marginBottom: 8 },
  songsTitle: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  songsCount: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  row: { paddingVertical: 11, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center' },
  trackArt: { borderRadius: 14, shadowOpacity: 0 },
  trackCopy: { flex: 1, marginLeft: 13 },
  trackTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  trackArtist: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 5 },
  index: { fontFamily: 'Inter_600SemiBold', fontSize: 12, marginLeft: 10 },
  emptyCard: { alignItems: 'center', borderRadius: 20, borderWidth: 1, padding: 24, marginTop: 8 },
  emptyCardTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, textAlign: 'center', marginTop: 14 },
  emptyCardCopy: { fontFamily: 'Inter_400Regular', fontSize: 13, textAlign: 'center', lineHeight: 20, marginTop: 8 },
  emptyAdd: { borderRadius: 13, paddingHorizontal: 18, paddingVertical: 12, marginTop: 18 },
  emptyAddText: { fontFamily: 'Inter_700Bold', fontSize: 12 },
  deleteButton: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 7, padding: 14, marginBottom: 12 },
  deleteText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  modalLayer: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(4,5,9,0.72)', justifyContent: 'flex-end', zIndex: 30 },
  modalSheet: { maxHeight: '82%', minHeight: 350, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, padding: 20, paddingBottom: 28 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontFamily: 'Inter_700Bold', fontSize: 21 },
  chooseList: { flexGrow: 0 },
  chooseRow: { minHeight: 62, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center' },
  chooseArt: { borderRadius: 12, shadowOpacity: 0 },
  chooseCopy: { flex: 1, marginHorizontal: 12 },
  chooseTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  chooseArtist: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 },
  checkbox: { width: 24, height: 24, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  noTracks: { fontFamily: 'Inter_400Regular', textAlign: 'center', paddingVertical: 30 },
  saveSongs: { minHeight: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginTop: 17 },
  saveSongsText: { fontFamily: 'Inter_700Bold', fontSize: 13 },
});