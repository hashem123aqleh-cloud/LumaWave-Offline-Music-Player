import { Feather } from '@expo/vector-icons';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenTransition } from '@/components/ScreenTransition';
import { useColors } from '@/hooks/useColors';
import { PlaybackSpeed, useMusic } from '@/context/MusicContext';

const playbackSpeeds: PlaybackSpeed[] = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { tracks, addTracks, playbackSpeed, setPlaybackSpeed } = useMusic();
  const showAbout = () => Alert.alert('LumaWave', 'A private space for the music you already own. Your library stays on this iPhone.');
  const topInset = Math.max(insets.top, Platform.OS === 'web' ? 67 : 24);

  return (
    <ScreenTransition>
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={[styles.container, { paddingTop: topInset + 24, paddingBottom: 130 }]} showsVerticalScrollIndicator={false}>
          <Text style={[styles.kicker, { color: colors.primary }]}>PERSONALIZE</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
          <View style={[styles.storageCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.storageIcon, { backgroundColor: colors.accent }]}><Feather name="hard-drive" size={20} color={colors.primary} /></View>
            <View style={{ flex: 1 }}><Text style={[styles.cardTitle, { color: colors.foreground }]}>Offline library</Text><Text style={[styles.cardSub, { color: colors.mutedForeground }]}>{tracks.length} {tracks.length === 1 ? 'track' : 'tracks'} stored on this iPhone</Text></View>
            <Feather name="check-circle" size={20} color={colors.primary} />
          </View>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>PLAYBACK</Text>
          <View style={[styles.playbackCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.playbackHeader}>
              <View style={[styles.optionIcon, { backgroundColor: colors.accent }]}><Feather name="sliders" size={18} color={colors.primary} /></View>
              <View style={{ flex: 1 }}><Text style={[styles.cardTitle, { color: colors.foreground }]}>Playback speed</Text><Text style={[styles.cardSub, { color: colors.mutedForeground }]}>Change how quickly your music plays</Text></View>
              <Text style={[styles.speedValue, { color: colors.primary }]}>{playbackSpeed}x</Text>
            </View>
            <View style={styles.speedRow}>
              {playbackSpeeds.map((speed) => {
                const selected = playbackSpeed === speed;
                return <Pressable key={speed} onPress={() => setPlaybackSpeed(speed)} accessibilityRole="button" accessibilityLabel={`Playback speed ${speed} times`} style={[styles.speedOption, { backgroundColor: selected ? colors.primary : colors.secondary, borderColor: selected ? colors.primary : colors.border }]}><Text style={[styles.speedText, { color: selected ? colors.primaryForeground : colors.mutedForeground }]}>{speed}x</Text></Pressable>;
              })}
            </View>
          </View>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>LIBRARY</Text>
          <Pressable onPress={() => void addTracks()} style={[styles.option, { borderBottomColor: colors.border }]}><View style={[styles.optionIcon, { backgroundColor: colors.secondary }]}><Feather name="folder-plus" size={18} color={colors.foreground} /></View><Text style={[styles.optionText, { color: colors.foreground }]}>Import from Files</Text><Feather name="chevron-right" size={18} color={colors.mutedForeground} /></Pressable>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ABOUT</Text>
          <Pressable onPress={showAbout} style={[styles.option, { borderBottomColor: colors.border }]}><View style={[styles.optionIcon, { backgroundColor: colors.secondary }]}><Feather name="info" size={18} color={colors.foreground} /></View><Text style={[styles.optionText, { color: colors.foreground }]}>About this app</Text><Feather name="chevron-right" size={18} color={colors.mutedForeground} /></Pressable>
          <View style={[styles.note, { backgroundColor: colors.accent }]}><Feather name="shield" size={16} color={colors.primary} /><Text style={[styles.noteText, { color: colors.accentForeground }]}>Music is stored locally. No account or internet connection is needed to listen.</Text></View>
        </ScrollView>
      </View>
    </ScreenTransition>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { paddingHorizontal: 20 },
  kicker: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.6 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 34, marginTop: 7, marginBottom: 30 },
  storageCard: { borderRadius: 20, borderWidth: 1, padding: 16, flexDirection: 'row', alignItems: 'center' },
  playbackCard: { borderRadius: 20, borderWidth: 1, padding: 15 },
  playbackHeader: { flexDirection: 'row', alignItems: 'center' },
  storageIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 13 },
  cardTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  cardSub: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 5 },
  speedValue: { fontFamily: 'Inter_700Bold', fontSize: 15 },
  speedRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 15 },
  speedOption: { minWidth: 49, height: 36, paddingHorizontal: 12, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  speedText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  sectionLabel: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.5, marginTop: 30, marginBottom: 8 },
  option: { minHeight: 63, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center' },
  optionIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 13 },
  optionText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 14 },
  note: { borderRadius: 16, padding: 15, flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 32 },
  noteText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18 },
});