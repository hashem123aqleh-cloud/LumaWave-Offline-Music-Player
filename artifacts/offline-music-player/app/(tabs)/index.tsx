import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MusicArtwork } from '@/components/MusicArtwork';
import { NowPlayingBar } from '@/components/NowPlayingBar';
import { useMusic } from '@/context/MusicContext';
import { useColors } from '@/hooks/useColors';

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tracks, currentTrack, playTrack, addTracks } = useMusic();
  const recent = tracks.slice(0, 3);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 18, paddingBottom: 112 }} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}><View><Text style={[styles.greeting, { color: colors.mutedForeground }]}>YOUR SOUNDTRACK</Text><Text style={[styles.title, { color: colors.foreground }]}>Good evening</Text></View><Pressable onPress={() => router.push('/(tabs)/settings')} style={[styles.profile, { backgroundColor: colors.accent }]}><Text style={[styles.profileText, { color: colors.primary }]}>M</Text></Pressable></View>
        <ImageBackground source={require('@/assets/images/cover-midnight.jpg')} imageStyle={styles.heroImage} style={styles.hero}>
          <View style={styles.heroShade} />
          <View style={styles.heroContent}><View style={styles.offlinePill}><Feather name="download" size={12} color="#D9D5FF" /><Text style={styles.offlineText}>OFFLINE MODE</Text></View><Text style={styles.heroTitle}>Your music.{'\n'}Everywhere.</Text><Text style={styles.heroCopy}>The songs you own, ready when you are.</Text><Pressable onPress={() => void addTracks()} style={styles.heroButton}><Text style={styles.heroButtonText}>Add music</Text><Feather name="arrow-up-right" size={16} color="#0C0D12" /></Pressable></View>
        </ImageBackground>
        <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recently added</Text><Pressable onPress={() => router.push('/(tabs)/library')}><Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text></Pressable></View>
        {recent.length === 0 ? <View style={[styles.emptyRow, { borderColor: colors.border }]}><Feather name="music" size={18} color={colors.mutedForeground} /><Text style={[styles.emptyRowText, { color: colors.mutedForeground }]}>Import a few MP3s to see them here.</Text></View> : recent.map((track) => <Pressable key={track.id} onPress={() => { playTrack(track); router.push('/player'); }} style={({ pressed }) => [styles.trackRow, { opacity: pressed ? 0.7 : 1 }]}><MusicArtwork coverKey={track.coverKey} size={52} style={styles.trackArt} /><View style={styles.trackCopy}><Text style={[styles.trackTitle, { color: colors.foreground }]} numberOfLines={1}>{track.title}</Text><Text style={[styles.trackArtist, { color: colors.mutedForeground }]} numberOfLines={1}>{track.artist}</Text></View><Feather name="play-circle" size={23} color={colors.primary} /></Pressable>)}
        <View style={[styles.tip, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.tipIcon, { backgroundColor: colors.accent }]}><Feather name="headphones" size={17} color={colors.primary} /></View><View style={{ flex: 1 }}><Text style={[styles.tipTitle, { color: colors.foreground }]}>Made for your pocket</Text><Text style={[styles.tipCopy, { color: colors.mutedForeground }]}>Playback keeps going with your screen locked.</Text></View></View>
      </ScrollView>
      {currentTrack ? <NowPlayingBar onPress={() => router.push('/player')} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: { paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greeting: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.7 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 28, marginTop: 8 },
  profile: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  profileText: { fontFamily: 'Inter_700Bold', fontSize: 16 },
  hero: { height: 285, marginHorizontal: 20, marginTop: 26, overflow: 'hidden', borderRadius: 26 },
  heroImage: { borderRadius: 26 },
  heroShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(9,10,16,0.48)' },
  heroContent: { flex: 1, padding: 24, justifyContent: 'flex-end' },
  offlinePill: { position: 'absolute', top: 20, left: 22, flexDirection: 'row', gap: 7, alignItems: 'center' },
  offlineText: { color: '#D9D5FF', fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.3 },
  heroTitle: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 31, lineHeight: 35 },
  heroCopy: { color: '#D7D9E4', fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 10 },
  heroButton: { alignSelf: 'flex-start', backgroundColor: '#F7F8FC', borderRadius: 13, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 16, paddingVertical: 11, marginTop: 18 },
  heroButtonText: { color: '#0C0D12', fontFamily: 'Inter_700Bold', fontSize: 12 },
  sectionHeader: { marginHorizontal: 20, marginTop: 30, marginBottom: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  seeAll: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  emptyRow: { marginHorizontal: 20, borderWidth: 1, borderRadius: 17, padding: 18, flexDirection: 'row', gap: 10, alignItems: 'center' },
  emptyRowText: { fontFamily: 'Inter_400Regular', fontSize: 13 },
  trackRow: { marginHorizontal: 20, flexDirection: 'row', alignItems: 'center', paddingVertical: 9 },
  trackArt: { borderRadius: 14, shadowOpacity: 0 },
  trackCopy: { flex: 1, marginHorizontal: 13 },
  trackTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  trackArtist: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 5 },
  tip: { marginHorizontal: 20, borderRadius: 19, borderWidth: 1, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 28 },
  tipIcon: { width: 39, height: 39, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  tipTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  tipCopy: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 },
});
