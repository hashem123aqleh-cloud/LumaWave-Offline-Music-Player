import { useEffect, useMemo, useState } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';

type SeekBarProps = {
  position: number;
  duration: number;
  onSeek: (seconds: number) => void | Promise<void>;
  trackColor: string;
  fillColor: string;
  thumbColor: string;
};

export function SeekBar({ position, duration, onSeek, trackColor, fillColor, thumbColor }: SeekBarProps) {
  const [width, setWidth] = useState(1);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [draftPosition, setDraftPosition] = useState(position);
  const displayedPosition = isScrubbing ? draftPosition : position;
  const progress = duration > 0 ? Math.max(0, Math.min(1, displayedPosition / duration)) : 0;

  useEffect(() => {
    if (!isScrubbing) setDraftPosition(position);
  }, [isScrubbing, position]);

  const seekFromX = (x: number) => {
    if (!duration) return;
    const nextPosition = Math.max(0, Math.min(duration, (x / width) * duration));
    setDraftPosition(nextPosition);
    void onSeek(nextPosition);
  };

  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => duration > 0,
    onMoveShouldSetPanResponder: () => duration > 0,
    onPanResponderTerminationRequest: () => false,
    onShouldBlockNativeResponder: () => true,
    onPanResponderGrant: (event) => {
      setIsScrubbing(true);
      seekFromX(event.nativeEvent.locationX);
    },
    onPanResponderMove: (event) => seekFromX(event.nativeEvent.locationX),
    onPanResponderRelease: () => setIsScrubbing(false),
    onPanResponderTerminate: () => setIsScrubbing(false),
  }), [duration, onSeek, width]);

  return (
    <View
      onLayout={(event) => setWidth(Math.max(1, event.nativeEvent.layout.width))}
      style={styles.touchArea}
      {...responder.panHandlers}
      accessibilityRole="adjustable"
      accessibilityLabel="Playback position"
      accessibilityValue={{ min: 0, max: duration, now: displayedPosition }}
    >
      <View style={[styles.track, { backgroundColor: trackColor }]}>
        <View style={[styles.fill, { backgroundColor: fillColor, width: `${progress * 100}%` }]} />
        <View style={[styles.thumb, { backgroundColor: thumbColor, left: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  touchArea: { width: '100%', height: 34, justifyContent: 'center' },
  track: { height: 6, borderRadius: 6, position: 'relative' },
  fill: { height: '100%', borderRadius: 6 },
  thumb: { position: 'absolute', width: 17, height: 17, borderRadius: 9, top: -5.5, marginLeft: -8.5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.26, shadowRadius: 5, elevation: 4 },
});