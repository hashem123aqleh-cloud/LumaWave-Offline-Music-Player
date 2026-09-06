import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MusicArtwork } from '@/components/MusicArtwork';
import { PlaylistEditorModal } from '@/components/PlaylistEditorModal';
import { ScreenTransition } from '@/components/ScreenTransition';
import { Track, useMusic } from '@/context/MusicContext';
import { useColors } from '@/hooks/useColors';

export default function LibraryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [actionTrack, setActionTrack] = useState<Track | null>(null);
  const [confirmDeleteTrack, setConfirmDeleteTrack] = useState<Track | null>(null);
  const { tracks, playlists, addTracks, playTrack, removeTrack, isLoading, createPlaylist, addTrackToPlaylist, toggleFavorite } = useMusic();
  const topInset = Math.max(insets.top, Platform.OS === 'web' ? 67 : 24);

  const visibleTracks = useMemo(() => tracks.filter((track) => {
    const matchesFilter = filter === 'all' || track.isFavorite;
    const normalizedQuery = query.trim().toLowerCase();
    return matchesFilter && (!normalizedQuery || `${track.title} ${track.artist}`.toLowerCase().includes(normalizedQuery));
  }), [filter, query, tracks]);

  const openTrackMenu = (track: Track) => {
    setActionTrack(track);
  };

  const closeTrackMenu = () => setActionTrack(null);
  const selectDelete = () => {
    if (!actionTrack) return;
    setConfirmDeleteTrack(actionTrack);
    closeTrackMenu();
  };

  const header = (
    <View>
      <View style={styles.header}>
        <View><Text style={[styles.kicker, { color: colors.primary }]}>YOUR COLLECTION</Text><Text style={[styles.title, { color: colors.foreground }]}>Library</Text></View>
        <Pressable onPress={() => void addTracks()} style={[styles.addButton, { backgroundColor: colors.primary }]}><Feather name="plus" size={20} color={colors.primaryForeground} /></Pressable>
      </View>
      <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}><Feather name="search" size={17} color={colors.mutedForeground} /><TextInput value={query} onChangeText={setQuery} placeholder="Search your music" placeholderTextColor={colors.mutedForeground} style={[styles.searchInput, { color: colors.foreground }]} /></View>
      <View style={styles.filterRow}>
        <Pressable onPress={() => setFilter('all')} style={[styles.filterButton, { backgroundColor: filter === 'all' ? colors.foreground : colors.secondary }]}><Text style={[styles.filterText, { color: filter === 'all' ? colors.background : colors.mutedForeground }]}>All songs</Text></Pressable>
        <Pressable onPress={() => setFilter('favorites')} style={[styles.filterButton, { backgroundColor: filter === 'favorites' ? colors.foreground : colors.secondary }]}><Feather name="heart" size={13} color={filter === 'favorites' ? colors.background : colors.mutedForeground} /><Text style={[styles.filterText, { color: filter === 'favorites' ? colors.background : colors.mutedForeground }]}>Favorites</Text></Pressable>
      </View>
      <View style={styles.playlistHeading}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Playlists</Text><Pressable onPress={() => setShowCreate(true)}><Text style={[styles.seeAll, { color: colors.primary }]}>New playlist</Text></Pressable></View>
      {playlists.length === 0 ? <Pressable onPress={() => setShowCreate(true)} style={[styles.createCard, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.createIcon, { backgroundColor: colors.accent }]}><Feather name="plus" size={18} color={colors.primary} /></View><View style={{ flex: 1 }}><Text style={[styles.createTitle, { color: colors.foreground }]}>Make your first playlist</Text><Text style={[styles.createCopy, { color: colors.mutedForeground }]}>Shape your library around a mood.</Text></View><Feather name="chevron-right" size={18} color={colors.mutedForeground} /></Pressable> : <View style={styles.playlistRail}>{playlists.slice(0, 4).map((playlist) => <Pressable key={playlist.id} onPress={() => router.push({ pathname: '/playlist', params: { id: playlist.id } })} style={({ pressed }) => [styles.playlistCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.74 : 1 }]}><MusicArtwork coverKey={playlist.coverKey} size={74} style={styles.playlistArt} /><Text style={[styles.playlistName, { color: colors.foreground }]} numberOfLines={1}>{playlist.name}</Text><Text style={[styles.playlistCount, { color: colors.mutedForeground }]}>{playlist.trackIds.length} songs</Text></Pressable>)}</View>}
      <View style={styles.songsHeading}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>{filter === 'favorites' ? 'Favorite songs' : 'All songs'}</Text><Text style={[styles.count, { color: colors.mutedForeground }]}>{visibleTracks.length}</Text></View>
    </View>
  );

  return (
    <ScreenTransition>
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <FlatList
          data={visibleTracks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: topInset + 22, paddingBottom: 126 }}
          ListHeaderComponent={header}
          ListEmptyComponent={!isLoading ? <View style={[styles.empty, { borderColor: colors.border, backgroundColor: colors.card }]}><View style={[styles.emptyIcon, { backgroundColor: colors.accent }]}><Feather name={filter === 'favorites' ? 'heart' : 'music'} size={22} color={colors.primary} /></View><Text style={[styles.emptyTitle, { color: colors.foreground }]}>{query ? 'No matches found' : filter === 'favorites' ? 'No favorites yet' : 'Your music, your way'}</Text><Text style={[styles.emptyText, { color: colors.mutedForeground }]}>{query ? 'Try another title or artist.' : filter === 'favorites' ? 'Tap the heart in the player to save a song here.' : 'Import MP3s from Files and they’ll stay available offline.'}</Text><Pressable onPress={() => void addTracks()} style={[styles.importButton, { backgroundColor: colors.foreground }]}><Text style={[styles.importButtonText, { color: colors.background }]}>{query || filter === 'favorites' ? 'Import MP3s' : 'Import MP3s'}</Text></Pressable></View> : null}
          renderItem={({ item, index }) => <View style={[styles.row, { borderBottomColor: colors.border }]}><Pressable onPress={() => { playTrack(item); router.push('/player'); }} style={({ pressed }) => [styles.rowMain, { opacity: pressed ? 0.72 : 1 }]}><MusicArtwork coverKey={item.coverKey} size={55} style={styles.artwork} /><View style={styles.rowCopy}><Text style={[styles.rowTitle, { color: colors.foreground }]} numberOfLines={1}>{item.title}</Text><Text style={[styles.rowArtist, { color: colors.mutedForeground }]} numberOfLines={1}>{item.artist}</Text></View><Text style={[styles.index, { color: colors.mutedForeground }]}>{String(index + 1).padStart(2, '0')}</Text></Pressable><Pressable accessibilityLabel={`Actions for ${item.title}`} accessibilityRole="button" onPress={() => openTrackMenu(item)} hitSlop={8} style={({ pressed }) => [styles.moreButton, { backgroundColor: colors.secondary, opacity: pressed ? 0.65 : 1 }]}><Feather name="more-horizontal" size={23} color={colors.foreground} /></Pressable></View>}
        />
        <PlaylistEditorModal visible={showCreate} title="New playlist" saveLabel="Create playlist" onClose={() => setShowCreate(false)} onSave={(name, description, coverKey) => { void createPlaylist(name, description, coverKey); setShowCreate(false); }} />
        <Modal visible={Boolean(actionTrack)} transparent animationType="fade" onRequestClose={closeTrackMenu}>
          <View style={styles.modalBackdrop}>
            <View style={[styles.actionSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.actionHeader}><View style={{ flex: 1 }}><Text style={[styles.actionTitle, { color: colors.foreground }]} numberOfLines={1}>{actionTrack?.title}</Text><Text style={[styles.actionSubtitle, { color: colors.mutedForeground }]}>Choose an action</Text></View><Pressable onPress={closeTrackMenu} hitSlop={12}><Feather name="x" size={21} color={colors.mutedForeground} /></Pressable></View>
              <Pressable onPress={() => { if (actionTrack) void toggleFavorite(actionTrack.id); closeTrackMenu(); }} style={[styles.actionItem, { borderTopColor: colors.border }]}><Feather name="heart" size={19} color={colors.primary} /><Text style={[styles.actionText, { color: colors.foreground }]}>{actionTrack?.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</Text></Pressable>
              {playlists.slice(0, 4).map((playlist) => <Pressable key={playlist.id} onPress={() => { if (actionTrack) void addTrackToPlaylist(playlist.id, actionTrack.id); closeTrackMenu(); }} style={[styles.actionItem, { borderTopColor: colors.border }]}><Feather name="plus-circle" size={19} color={colors.primary} /><Text style={[styles.actionText, { color: colors.foreground }]}>Add to {playlist.name}</Text></Pressable>)}
              <Pressable onPress={selectDelete} style={[styles.actionItem, { borderTopColor: colors.border }]}><Feather name="trash-2" size={19} color={colors.destructive} /><Text style={[styles.actionText, { color: colors.destructive }]}>Delete imported file</Text></Pressable>
              <Pressable onPress={closeTrackMenu} style={[styles.cancelAction, { backgroundColor: colors.secondary }]}><Text style={[styles.cancelText, { color: colors.foreground }]}>Cancel</Text></Pressable>
            </View>
          </View>
        </Modal>
        <Modal visible={Boolean(confirmDeleteTrack)} transparent animationType="fade" onRequestClose={() => setConfirmDeleteTrack(null)}>
          <View style={styles.modalBackdrop}>
            <View style={[styles.confirmSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.confirmIcon, { backgroundColor: colors.destructive + '20' }]}><Feather name="trash-2" size={22} color={colors.destructive} /></View>
              <Text style={[styles.confirmTitle, { color: colors.foreground }]}>Delete this imported file?</Text>
              <Text style={[styles.confirmCopy, { color: colors.mutedForeground }]} numberOfLines={2}>{confirmDeleteTrack?.title} will be removed from the app and its offline storage.</Text>
              <View style={styles.confirmButtons}><Pressable onPress={() => setConfirmDeleteTrack(null)} style={[styles.confirmButton, { backgroundColor: colors.secondary }]}><Text style={[styles.cancelText, { color: colors.foreground }]}>Cancel</Text></Pressable><Pressable onPress={() => { if (confirmDeleteTrack) void removeTrack(confirmDeleteTrack.id); setConfirmDeleteTrack(null); }} style={[styles.confirmButton, { backgroundColor: colors.destructive }]}><Text style={[styles.cancelText, { color: colors.destructiveForeground }]}>Delete</Text></Pressable></View>
            </View>
          </View>
        </Modal>
      </View>
    </ScreenTransition>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  kicker: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.6 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 34, marginTop: 7 },
  addButton: { width: 45, height: 45, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  searchBox: { marginHorizontal: 20, minHeight: 48, borderRadius: 15, borderWidth: 1, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center' },
  searchInput: { flex: 1, marginLeft: 10, fontFamily: 'Inter_400Regular', fontSize: 14 },
  filterRow: { flexDirection: 'row', gap: 9, marginHorizontal: 20, marginTop: 13 },
  filterButton: { minHeight: 34, borderRadius: 17, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 6 },
  filterText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  playlistHeading: { marginHorizontal: 20, marginTop: 28, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  seeAll: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  playlistRail: { flexDirection: 'row', gap: 12, paddingLeft: 20, paddingRight: 20 },
  playlistCard: { width: 126, borderRadius: 18, borderWidth: 1, padding: 9 },
  playlistArt: { borderRadius: 12, shadowOpacity: 0 },
  playlistName: { fontFamily: 'Inter_600SemiBold', fontSize: 13, marginTop: 9 },
  playlistCount: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 },
  createCard: { marginHorizontal: 20, borderRadius: 18, borderWidth: 1, padding: 13, flexDirection: 'row', alignItems: 'center' },
  createIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  createTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  createCopy: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 },
  songsHeading: { marginHorizontal: 20, marginTop: 30, marginBottom: 7, flexDirection: 'row', alignItems: 'center', gap: 9 },
  count: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  empty: { marginHorizontal: 20, borderRadius: 24, borderWidth: 1, padding: 24, alignItems: 'center', marginTop: 8 },
  emptyIcon: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  emptyTitle: { fontFamily: 'Inter_700Bold', fontSize: 19 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 14, textAlign: 'center', lineHeight: 21, marginTop: 9 },
  importButton: { paddingHorizontal: 20, paddingVertical: 13, borderRadius: 14, marginTop: 20 },
  importButtonText: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  row: { marginHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center' },
  rowMain: { flex: 1, minHeight: 58, flexDirection: 'row', alignItems: 'center' },
  artwork: { borderRadius: 14, shadowOpacity: 0 },
  rowCopy: { flex: 1, marginLeft: 14 },
  rowTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  rowArtist: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 6 },
  index: { fontFamily: 'Inter_600SemiBold', fontSize: 12, marginLeft: 10 },
  moreButton: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginLeft: 9 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(4,5,9,0.72)', justifyContent: 'flex-end' },
  actionSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, padding: 21, paddingBottom: 30 },
  actionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  actionTitle: { fontFamily: 'Inter_700Bold', fontSize: 20 },
  actionSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 4 },
  actionItem: { minHeight: 56, borderTopWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  actionText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  cancelAction: { minHeight: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginTop: 14 },
  cancelText: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  confirmSheet: { margin: 20, borderRadius: 24, borderWidth: 1, padding: 22, alignItems: 'center' },
  confirmIcon: { width: 50, height: 50, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  confirmTitle: { fontFamily: 'Inter_700Bold', fontSize: 19, textAlign: 'center', marginTop: 16 },
  confirmCopy: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 8 },
  confirmButtons: { width: '100%', flexDirection: 'row', gap: 10, marginTop: 22 },
  confirmButton: { flex: 1, minHeight: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});