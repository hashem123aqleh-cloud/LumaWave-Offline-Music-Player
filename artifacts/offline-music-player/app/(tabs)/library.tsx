import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, FlatList, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MusicArtwork } from '@/components/MusicArtwork';
import { NowPlayingBar } from '@/components/NowPlayingBar';
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
  const { tracks, playlists, addTracks, playTrack, removeTrack, isLoading, createPlaylist, addTrackToPlaylist, toggleFavorite } = useMusic();
  const topInset = Math.max(insets.top, Platform.OS === 'web' ? 67 : 24);

  const visibleTracks = useMemo(() => tracks.filter((track) => {
    const matchesFilter = filter === 'all' || track.isFavorite;
    const normalizedQuery = query.trim().toLowerCase();
    return matchesFilter && (!normalizedQuery || `${track.title} ${track.artist}`.toLowerCase().includes(normalizedQuery));
  }), [filter, query, tracks]);

  const openTrackMenu = (track: Track) => {
    const playlistButtons = playlists.slice(0, 4).map((playlist) => ({
      text: `Add to ${playlist.name}`,
      onPress: () => void addTrackToPlaylist(playlist.id, track.id),
    }));
    Alert.alert(track.title, 'Choose an action', [
      { text: track.isFavorite ? 'Remove from Favorites' : 'Add to Favorites', onPress: () => void toggleFavorite(track.id) },
      ...playlistButtons,
      { text: 'Delete imported file', style: 'destructive', onPress: () => void removeTrack(track.id) },
      { text: 'Cancel', style: 'cancel' },
    ]);
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
          renderItem={({ item, index }) => <Pressable onPress={() => { playTrack(item); router.push('/player'); }} style={({ pressed }) => [styles.row, { borderBottomColor: colors.border, opacity: pressed ? 0.72 : 1 }]}><MusicArtwork coverKey={item.coverKey} size={55} style={styles.artwork} /><View style={styles.rowCopy}><Text style={[styles.rowTitle, { color: colors.foreground }]} numberOfLines={1}>{item.title}</Text><Text style={[styles.rowArtist, { color: colors.mutedForeground }]} numberOfLines={1}>{item.artist}</Text></View><Text style={[styles.index, { color: colors.mutedForeground }]}>{String(index + 1).padStart(2, '0')}</Text><Pressable onPress={() => openTrackMenu(item)} hitSlop={10} style={styles.moreButton}><Feather name="more-horizontal" size={19} color={colors.mutedForeground} /></Pressable></Pressable>}
        />
        <NowPlayingBar onPress={() => router.push('/player')} />
        <PlaylistEditorModal visible={showCreate} title="New playlist" saveLabel="Create playlist" onClose={() => setShowCreate(false)} onSave={(name, description, coverKey) => { void createPlaylist(name, description, coverKey); setShowCreate(false); }} />
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
  row: { marginHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center' },
  artwork: { borderRadius: 14, shadowOpacity: 0 },
  rowCopy: { flex: 1, marginLeft: 14 },
  rowTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  rowArtist: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 6 },
  index: { fontFamily: 'Inter_600SemiBold', fontSize: 12, marginLeft: 10 },
  moreButton: { width: 30, alignItems: 'flex-end', marginLeft: 7 },
});