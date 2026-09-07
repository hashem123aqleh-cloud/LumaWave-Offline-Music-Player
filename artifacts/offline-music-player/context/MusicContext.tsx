import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAudioPlayer, useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { extractEmbeddedArtwork } from '@/lib/audioMetadata';

export type CoverKey = 'midnight' | 'neon' | 'dusk';
export type PlaybackSpeed = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2;

export type Track = {
  id: string;
  title: string;
  artist: string;
  album: string;
  uri: string;
  coverKey: CoverKey;
  artworkUri?: string;
  artworkChecked?: boolean;
  isFavorite?: boolean;
  importedAt?: number;
  duration?: number;
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
  playbackSpeed: PlaybackSpeed;
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
  setPlaybackSpeed: (value: PlaybackSpeed) => void;
  playTrack: (track: Track, queueTrackIds?: string[]) => void;
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

async function readAudioDuration(uri: string): Promise<number | undefined> {
  if (Platform.OS === 'web') return undefined;

  return new Promise((resolve) => {
    let settled = false;
    let subscription: { remove: () => void } | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      const metadataPlayer = createAudioPlayer(uri);
      const finish = (duration?: number) => {
        if (settled) return;
        settled = true;
        if (timeout) clearTimeout(timeout);
        subscription?.remove();
        metadataPlayer.release();
        resolve(duration && Number.isFinite(duration) && duration > 0 ? Math.round(duration) : undefined);
      };
      subscription = metadataPlayer.addListener('playbackStatusUpdate', (nextStatus) => {
        if (nextStatus.isLoaded) finish(nextStatus.duration);
      });
      if (metadataPlayer.isLoaded) finish(metadataPlayer.duration);
      timeout = setTimeout(() => finish(), 5000);
    } catch {
      resolve(undefined);
    }
  });
}

export function MusicProvider({ children }: PropsWithChildren) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
  const [queueTrackIds, setQueueTrackIds] = useState<string[]>([]);
  const [volume, setVolumeState] = useState(1);
  const [playbackSpeed, setPlaybackSpeedState] = useState<PlaybackSpeed>(1);
  const player = useAudioPlayer(currentTrack?.uri ?? null, { updateInterval: 500 });
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
          const parsed = JSON.parse(storedSettings) as { volume?: number; playbackSpeed?: number };
          if (typeof parsed.volume === 'number') setVolumeState(Math.max(0, Math.min(1, parsed.volume)));
          if ([0.5, 0.75, 1, 1.25, 1.5, 2].includes(parsed.playbackSpeed ?? 1)) setPlaybackSpeedState(parsed.playbackSpeed as PlaybackSpeed);
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
    const persistTimer = setTimeout(() => {
      void AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ volume, playbackSpeed }));
    }, 250);
    return () => clearTimeout(persistTimer);
  }, [player, playbackSpeed, volume]);

  useEffect(() => {
    if (!status.isLoaded) return;
    player.setPlaybackRate(playbackSpeed);
  }, [player, playbackSpeed, status.isLoaded]);

  useEffect(() => {
    if (!currentTrack && tracks.length > 0) {
      setCurrentTrack(tracks[0]);
    }
  }, [currentTrack, tracks]);

  useEffect(() => {
    if (shouldAutoPlay && currentTrack && status.isLoaded) {
      player.play();
      setShouldAutoPlay(false);
    }
  }, [currentTrack, player, shouldAutoPlay, status.isLoaded]);

  const persistTracks = async (nextTracks: Track[]) => {
    setTracks(nextTracks);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextTracks));
  };

  useEffect(() => {
    if (!currentTrack || !status.isLoaded || !Number.isFinite(status.duration) || status.duration <= 0) return;
    const duration = Math.round(status.duration);
    if (currentTrack.duration === duration) return;
    const nextTracks = tracks.map((track) => track.id === currentTrack.id ? { ...track, duration } : track);
    setTracks(nextTracks);
    setCurrentTrack({ ...currentTrack, duration });
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextTracks));
  }, [currentTrack, status.duration, status.isLoaded, tracks]);

  useEffect(() => {
    if (Platform.OS === 'web' || isLoading) return;
    const tracksNeedingMetadata = tracks.filter((track) => typeof track.duration !== 'number' || !track.artworkChecked);
    if (!tracksNeedingMetadata.length) return;
    let cancelled = false;

    void Promise.all(tracksNeedingMetadata.map(async (track) => ({
      id: track.id,
      duration: typeof track.duration === 'number' ? track.duration : await readAudioDuration(track.uri),
      artworkUri: track.artworkUri ?? await extractEmbeddedArtwork(track.uri, track.id),
    }))).then(async (metadataUpdates) => {
      if (cancelled) return;
      const metadata = new Map(metadataUpdates.map((item) => [item.id, item]));
      const nextTracks = tracks.map((track) => {
        const update = metadata.get(track.id);
        if (!update) return track;
        return {
          ...track,
          artworkChecked: true,
          ...(typeof update.duration === 'number' ? { duration: update.duration } : {}),
          ...(update.artworkUri ? { artworkUri: update.artworkUri } : {}),
        };
      });
      setTracks(nextTracks);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextTracks));
      setCurrentTrack((activeTrack) => {
        if (!activeTrack) return activeTrack;
        const update = metadata.get(activeTrack.id);
        return update ? {
          ...activeTrack,
          artworkChecked: true,
          ...(typeof update.duration === 'number' ? { duration: update.duration } : {}),
          ...(update.artworkUri ? { artworkUri: update.artworkUri } : {}),
        } : activeTrack;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [isLoading, tracks]);

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
          artworkChecked: false,
          isFavorite: false,
          importedAt: Date.now(),
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

  const requestPlay = () => {
    if (!currentTrack) return;
    if (status.isLoaded) player.play();
    else setShouldAutoPlay(true);
  };

  const playTrack = (track: Track, customQueueTrackIds?: string[]) => {
    const nextQueue = customQueueTrackIds?.length ? customQueueTrackIds : tracks.map((item) => item.id);
    setQueueTrackIds(nextQueue);
    if (currentTrack?.id === track.id) {
      requestPlay();
      return;
    }
    setCurrentTrack(track);
    setShouldAutoPlay(true);
  };

  const togglePlayback = () => {
    if (!currentTrack) return;
    if (status.playing) player.pause();
    else requestPlay();
  };

  const skip = (direction: 1 | -1) => {
    if (!tracks.length || !currentTrack) return;
    const activeQueue = queueTrackIds.length ? queueTrackIds : tracks.map((track) => track.id);
    const queueTracks = activeQueue.map((trackId) => tracks.find((track) => track.id === trackId)).filter((track): track is Track => Boolean(track));
    if (!queueTracks.length) return;
    const index = queueTracks.findIndex((track) => track.id === currentTrack.id);
    const next = queueTracks[(index + direction + queueTracks.length) % queueTracks.length];
    setCurrentTrack(next);
    setShouldAutoPlay(status.playing);
  };

  const removeTrack = async (id: string) => {
    const trackToRemove = tracks.find((track) => track.id === id);
    if (!trackToRemove) return;

    if (currentTrack?.id === id) {
      player.pause();
    }

    const appMusicDirectory = FileSystem.documentDirectory ? `${FileSystem.documentDirectory}music/` : null;
    const isAppOwnedFile = Platform.OS !== 'web' && appMusicDirectory && trackToRemove.uri.startsWith(appMusicDirectory);
    if (isAppOwnedFile) {
      try {
        await FileSystem.deleteAsync(trackToRemove.uri, { idempotent: true });
      } catch {
        Alert.alert('Delete failed', 'The imported file could not be removed from this device.');
        return;
      }
    }
    if (isAppOwnedFile && trackToRemove.artworkUri?.startsWith(appMusicDirectory)) {
      await FileSystem.deleteAsync(trackToRemove.artworkUri, { idempotent: true });
    }

    const nextTracks = tracks.filter((track) => track.id !== id);
    setQueueTrackIds((currentQueue) => currentQueue.filter((trackId) => trackId !== id));
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

  const setVolume = useCallback((value: number) => {
    const nextVolume = Math.max(0, Math.min(1, value));
    setVolumeState(nextVolume);
    player.volume = nextVolume;
  }, [player]);

  const setPlaybackSpeed = useCallback((value: PlaybackSpeed) => {
    setPlaybackSpeedState(value);
  }, []);

  const seekTo = useCallback((seconds: number) => player.seekTo(seconds), [player]);

  const value = useMemo<MusicContextValue>(() => ({
    tracks,
    playlists,
    currentTrack,
    isPlaying: status.playing,
    isLoading,
    progress: status.currentTime,
    duration: status.duration,
    volume,
    playbackSpeed,
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
    setPlaybackSpeed,
    playTrack,
    togglePlayback,
    skipForward: () => skip(1),
    skipBack: () => skip(-1),
    seekTo,
  }), [currentTrack, isLoading, playbackSpeed, player, playlists, queueTrackIds, seekTo, setPlaybackSpeed, setVolume, status.currentTime, status.duration, status.playing, tracks, volume]);

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) throw new Error('useMusic must be used inside MusicProvider');
  return context;
}