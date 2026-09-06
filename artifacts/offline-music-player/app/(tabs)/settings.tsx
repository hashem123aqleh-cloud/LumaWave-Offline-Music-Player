import { Feather } from '@expo/vector-icons';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { NowPlayingBar } from '@/components/NowPlayingBar';
import { ScreenTransition } from '@/components/ScreenTransition';
import { useColors } from '@/hooks/useColors';
import { useMusic } from '@/context/MusicContext';

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tracks, addTracks, currentTrack } = useMusic();
  const showAbout = () => Alert.alert('Offline Music Player', 'A private space for the music you already own. Your library stays on this iPhone.');
  const topInset = Math.max(insets.top, Platform.OS === 'web' ? 67 : 24);

  return (
    <ScreenTransition>
      <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={[styles.container, { paddingTop: topInset + 24, paddingBottom: 130 }]} showsVerticalScrollIndicator={false}>
      <Text style={[styles.kicker, { color: colors.primary }]}>PERSONALIZE</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
      <View style={[styles.storageCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.storageIcon, { backgroundColor: colors.accent }]}><Feather name="hard-drive" size={20} color={colors.primary} /></View>
        <View style={{ flex: 1 }}><Text style={[styles.cardTitle, { color: colors.foreground }]}>Offline library</Text><Text style={[styles.cardSub, { color: colors.mutedForeground }]}>{tracks.length} {tracks.length === 1 ? 'track' : 'tracks'} stored on this iPhone</Text></View>
        <Feather name="check-circle" size={20} color={colors.primary} />
      </View>
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>LIBRARY</Text>
      <Pressable onPress={() => void addTracks()} style={[styles.option, { borderBottomColor: colors.border }]}><View style={[styles.optionIcon, { backgroundColor: colors.secondary }]}><Feather name="folder-plus" size={18} color={colors.foreground} /></View><Text style={[styles.optionText, { color: colors.foreground }]}>Import from Files</Text><Feather name="chevron-right" size={18} color={colors.mutedForeground} /></Pressable>
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ABOUT</Text>
      <Pressable onPress={showAbout} style={[styles.option, { borderBottomColor: colors.border }]}><View style={[styles.optionIcon, { backgroundColor: colors.secondary }]}><Feather name="info" size={18} color={colors.foreground} /></View><Text style={[styles.optionText, { color: colors.foreground }]}>About this app</Text><Feather name="chevron-right" size={18} color={colors.mutedForeground} /></Pressable>
      <View style={[styles.note, { backgroundColor: colors.accent }]}><Feather name="shield" size={16} color={colors.primary} /><Text style={[styles.noteText, { color: colors.accentForeground }]}>Music is stored locally. No account or internet connection is needed to listen.</Text></View>
      {currentTrack ? <NowPlayingBar onPress={() => router.push('/player')} /> : null}
      </ScrollView>
    </ScreenTransition>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  kicker: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.6 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 34, marginTop: 7, marginBottom: 30 },
  storageCard: { borderRadius: 20, borderWidth: 1, padding: 16, flexDirection: 'row', alignItems: 'center' },
  storageIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 13 },
  cardTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  cardSub: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 5 },
  sectionLabel: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.5, marginTop: 30, marginBottom: 8 },
  option: { minHeight: 63, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center' },
  optionIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 13 },
  optionText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 14 },
  note: { borderRadius: 16, padding: 15, flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 32 },
  noteText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18 },
});