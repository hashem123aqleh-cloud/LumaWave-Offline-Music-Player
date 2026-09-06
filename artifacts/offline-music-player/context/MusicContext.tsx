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
  isFavorite?: boolean;
};

export type Playlist = {
  id: string;
  name: string;
  description: string;
  coverKey: CoverKey;
  trackIds: string[];
  createdAt: number;
};

type MusicContextValue = {
  tracks: Track[];
  playlists: Playlist[];
  currentTrack: Track | null;
  isPlaying: boolean;
  isLoading: boolean;
  progress: number;
  duration: number;
  volume: number;
  addTracks: () => Promise<void>;
  removeTrack: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  createPlaylist: (name: string, description?: string, coverKey?: CoverKey) => Promise<Playlist | null>;
  updatePlaylist: (id: string, updates: Partial<Pick<Playlist, 'name' | 'description' | 'coverKey'>>) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  addTrackToPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  setPlaylistTracks: (playlistId: string, trackIds: string[]) => Promise<void>;
  setVolume: (value: number) => void;
  playTrack: (track: Track) => void;
  togglePlayback: () => void;
  skipForward: () => void;
  skipBack: () => void;
  seekTo: (seconds: number) => Promise<void>;
};

const STORAGE_KEY = '@offline-music-player/library';
const PLAYLISTS_KEY = '@offline-music-player/playlists';
const SETTINGS_KEY = '@offline-music-player/settings';
const MusicContext = createContext<MusicContextValue | null>(null);

const coverKeys: CoverKey[] = ['midnight', 'neon', 'dusk'];

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function titleFromFileName(name: string) {
  return name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim() || 'Untitled track';
}

export function MusicProvider({ children }: PropsWithChildren) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
  const [volume, setVolumeState] = useState(1);
  const player = useAudioPlayer(currentTrack?.uri ?? null, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'doNotMix',
      shouldPlayInBackground: true,
      interruptionModeAndroid: 'doNotMix',
    });
    void Promise.all([
      AsyncStorage.getItem(STORAGE_KEY),
      AsyncStorage.getItem(PLAYLISTS_KEY),
      AsyncStorage.getItem(SETTINGS_KEY),
    ]).then(([storedTracks, storedPlaylists, storedSettings]) => {
      try {
        if (storedTracks) setTracks(JSON.parse(storedTracks) as Track[]);
        if (storedPlaylists) setPlaylists(JSON.parse(storedPlaylists) as Playlist[]);
        if (storedSettings) {
          const parsed = JSON.parse(storedSettings) as { volume?: number };
          if (typeof parsed.volume === 'number') setVolumeState(Math.max(0, Math.min(1, parsed.volume)));
        }
      } catch {
        setTracks([]);
        setPlaylists([]);
      }
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    player.volume = volume;
  }, [player, volume]);

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
          id: createId(`track-${index}`),
          title: titleFromFileName(asset.name),
          artist: 'Imported from Files',
          album: 'My offline library',
          uri: playableUri,
          coverKey: coverKeys[nextIndex % coverKeys.length],
          isFavorite: false,
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
    const nextPlaylists = playlists.map((playlist) => ({
      ...playlist,
      trackIds: playlist.trackIds.filter((trackId) => trackId !== id),
    }));
    setPlaylists(nextPlaylists);
    await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(nextPlaylists));
    if (currentTrack?.id === id) {
      const next = nextTracks[0] ?? null;
      setCurrentTrack(next);
      if (!next) player.pause();
    }
  };

  const toggleFavorite = async (id: string) => {
    const nextTracks = tracks.map((track) => (
      track.id === id ? { ...track, isFavorite: !track.isFavorite } : track
    ));
    await persistTracks(nextTracks);
  };

  const persistPlaylists = async (nextPlaylists: Playlist[]) => {
    setPlaylists(nextPlaylists);
    await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(nextPlaylists));
  };

  const createPlaylist = async (name: string, description = '', coverKey: CoverKey = 'neon') => {
    const trimmedName = name.trim();
    if (!trimmedName) return null;
    const playlist: Playlist = {
      id: createId('playlist'),
      name: trimmedName,
      description: description.trim(),
      coverKey,
      trackIds: [],
      createdAt: Date.now(),
    };
    await persistPlaylists([playlist, ...playlists]);
    return playlist;
  };

  const updatePlaylist = async (id: string, updates: Partial<Pick<Playlist, 'name' | 'description' | 'coverKey'>>) => {
    const nextPlaylists = playlists.map((playlist) => (
      playlist.id === id
        ? { ...playlist, ...updates, name: updates.name?.trim() || playlist.name }
        : playlist
    ));
    await persistPlaylists(nextPlaylists);
  };

  const deletePlaylist = async (id: string) => {
    await persistPlaylists(playlists.filter((playlist) => playlist.id !== id));
  };

  const addTrackToPlaylist = async (playlistId: string, trackId: string) => {
    const nextPlaylists = playlists.map((playlist) => (
      playlist.id === playlistId && !playlist.trackIds.includes(trackId)
        ? { ...playlist, trackIds: [...playlist.trackIds, trackId] }
        : playlist
    ));
    await persistPlaylists(nextPlaylists);
  };

  const removeTrackFromPlaylist = async (playlistId: string, trackId: string) => {
    const nextPlaylists = playlists.map((playlist) => (
      playlist.id === playlistId
        ? { ...playlist, trackIds: playlist.trackIds.filter((id) => id !== trackId) }
        : playlist
    ));
    await persistPlaylists(nextPlaylists);
  };

  const setPlaylistTracks = async (playlistId: string, trackIds: string[]) => {
    const nextPlaylists = playlists.map((playlist) => (
      playlist.id === playlistId
        ? { ...playlist, trackIds: Array.from(new Set(trackIds)) }
        : playlist
    ));
    await persistPlaylists(nextPlaylists);
  };

  const setVolume = (value: number) => {
    const nextVolume = Math.max(0, Math.min(1, value));
    setVolumeState(nextVolume);
    player.volume = nextVolume;
    void AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ volume: nextVolume }));
  };

  const value = useMemo<MusicContextValue>(() => ({
    tracks,
    playlists,
    currentTrack,
    isPlaying: status.playing,
    isLoading,
    progress: status.currentTime,
    duration: status.duration,
    volume,
    addTracks,
    removeTrack,
    toggleFavorite,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    setPlaylistTracks,
    setVolume,
    playTrack,
    togglePlayback,
    skipForward: () => skip(1),
    skipBack: () => skip(-1),
    seekTo: (seconds) => player.seekTo(seconds),
  }), [currentTrack, isLoading, player, playlists, status.currentTime, status.duration, status.playing, tracks, volume]);

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) throw new Error('useMusic must be used inside MusicProvider');
  return context;
}