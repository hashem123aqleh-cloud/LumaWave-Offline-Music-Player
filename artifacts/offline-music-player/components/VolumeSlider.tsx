import { Feather } from '@expo/vector-icons';
import { useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';

type VolumeSliderProps = {
  value: number;
  onChange: (value: number) => void;
  trackColor: string;
  fillColor: string;
  thumbColor: string;
};

export function VolumeSlider({ value, onChange, trackColor, fillColor, thumbColor }: VolumeSliderProps) {
  const [width, setWidth] = useState(1);
  const latestValue = useRef(value);
  const lastNativeVolumeAt = useRef(0);
  const updateFromX = (x: number, force = false) => {
    const nextValue = Math.max(0, Math.min(1, x / width));
    latestValue.current = nextValue;
    const now = Date.now();
    if (force || now - lastNativeVolumeAt.current >= 32) {
      lastNativeVolumeAt.current = now;
      onChange(nextValue);
    }
  };
  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
    onShouldBlockNativeResponder: () => true,
    onPanResponderGrant: (event) => updateFromX(event.nativeEvent.locationX, true),
    onPanResponderMove: (event) => updateFromX(event.nativeEvent.locationX),
    onPanResponderRelease: () => onChange(latestValue.current),
    onPanResponderTerminate: () => onChange(latestValue.current),
  }), [width, onChange]);

  return (
    <View style={styles.row}>
      <Feather name={value === 0 ? 'volume-x' : 'volume-1'} size={17} color={fillColor} />
      <View
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        style={styles.touchArea}
        {...responder.panHandlers}
      >
        <View style={[styles.track, { backgroundColor: trackColor }]}>
          <View style={[styles.fill, { backgroundColor: fillColor, width: `${value * 100}%` }]} />
          <View style={[styles.thumb, { backgroundColor: thumbColor, left: `${value * 100}%` }]} />
        </View>
      </View>
      <Feather name="volume-2" size={17} color={fillColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 10 },
  touchArea: { flex: 1, justifyContent: 'center', height: 32 },
  track: { height: 5, borderRadius: 5, overflow: 'visible', position: 'relative' },
  fill: { height: '100%', borderRadius: 5 },
  thumb: { position: 'absolute', width: 14, height: 14, borderRadius: 7, top: -4.5, marginLeft: -7, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.24, shadowRadius: 4, elevation: 3 },
});