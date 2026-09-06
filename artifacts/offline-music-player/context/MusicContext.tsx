import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { Alert, Platform } from 'react-native';

export type CoverKey = 'midnight' | 'neon' | 'dusk';

export type Track = {
  id: string;
  title: string;
  artist: string;
  album: string;
  uri: string;
  coverKey: CoverKey;
};

type MusicContextValue = {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  isLoading: boolean;
  progress: number;
  duration: number;
  addTracks: () => Promise<void>;
  removeTrack: (id: string) => Promise<void>;
  playTrack: (track: Track) => void;
  togglePlayback: () => void;
  skipForward: () => void;
  skipBack: () => void;
  seekTo: (seconds: number) => Promise<void>;
};

const STORAGE_KEY = '@offline-music-player/library';
const MusicContext = createContext<MusicContextValue | null>(null);

function titleFromFileName(name: string) {
  return name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim() || 'Untitled track';
}

export function MusicProvider({ children }: PropsWithChildren) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
  const player = useAudioPlayer(currentTrack?.uri ?? null, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'doNotMix',
      shouldPlayInBackground: true,
      interruptionModeAndroid: 'doNotMix',
    });
    void AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          setTracks(JSON.parse(stored) as Track[]);
        } catch {
          setTracks([]);
        }
      }
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!currentTrack && tracks.length > 0) {
      setCurrentTrack(tracks[0]);
    }
  }, [currentTrack, tracks]);

  useEffect(() => {
    if (shouldAutoPlay && currentTrack && player.isLoaded) {
      player.play();
      setShouldAutoPlay(false);
    }
  }, [currentTrack, player, player.isLoaded, shouldAutoPlay]);

  const persistTracks = async (nextTracks: Track[]) => {
    setTracks(nextTracks);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextTracks));
  };

  const addTracks = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/mpeg', 'audio/*'],
        copyToCacheDirectory: true,
        multiple: true,
      });
      if (result.canceled || result.assets.length === 0) return;

      const directory = FileSystem.documentDirectory;
      const musicDirectory = directory ? `${directory}music/` : null;
      if (musicDirectory && Platform.OS !== 'web') {
        await FileSystem.makeDirectoryAsync(musicDirectory, { intermediates: true });
      }

      const imported = await Promise.all(result.assets.map(async (asset, index) => {
        let playableUri = asset.uri;
        if (musicDirectory && Platform.OS !== 'web') {
          const safeName = asset.name.replace(/[^a-zA-Z0-9._-]/g, '-');
          const destination = `${musicDirectory}${Date.now()}-${index}-${safeName}`;
          await FileSystem.copyAsync({ from: asset.uri, to: destination });
          playableUri = destination;
        }
        const nextIndex = tracks.length + index;
        return {
          id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
          title: titleFromFileName(asset.name),
          artist: 'Imported from Files',
          album: 'My offline library',
          uri: playableUri,
          coverKey: (['midnight', 'neon', 'dusk'] as CoverKey[])[nextIndex % 3],
        } satisfies Track;
      }));
      const nextTracks = [...tracks, ...imported];
      await persistTracks(nextTracks);
      if (!currentTrack && imported[0]) setCurrentTrack(imported[0]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'The file could not be imported.';
      Alert.alert('Import failed', message);
    }
  };

  const playTrack = (track: Track) => {
    if (currentTrack?.id === track.id) {
      player.play();
      return;
    }
    setCurrentTrack(track);
    setShouldAutoPlay(true);
  };

  const togglePlayback = () => {
    if (!currentTrack) return;
    if (status.playing) player.pause();
    else player.play();
  };

  const skip = (direction: 1 | -1) => {
    if (!tracks.length || !currentTrack) return;
    const index = tracks.findIndex((track) => track.id === currentTrack.id);
    const next = tracks[(index + direction + tracks.length) % tracks.length];
    setCurrentTrack(next);
    setShouldAutoPlay(status.playing);
  };

  const removeTrack = async (id: string) => {
    const nextTracks = tracks.filter((track) => track.id !== id);
    await persistTracks(nextTracks);
    if (currentTrack?.id === id) {
      const next = nextTracks[0] ?? null;
      setCurrentTrack(next);
      if (!next) player.pause();
    }
  };

  const value = useMemo<MusicContextValue>(() => ({
    tracks,
    currentTrack,
    isPlaying: status.playing,
    isLoading,
    progress: status.currentTime,
    duration: status.duration,
    addTracks,
    removeTrack,
    playTrack,
    togglePlayback,
    skipForward: () => skip(1),
    skipBack: () => skip(-1),
    seekTo: (seconds) => player.seekTo(seconds),
  }), [currentTrack, isLoading, player, status.currentTime, status.duration, status.playing, tracks]);

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) throw new Error('useMusic must be used inside MusicProvider');
  return context;
}