import { Image, ImageSourcePropType, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { CoverKey } from '@/context/MusicContext';

const artwork: Record<CoverKey, ImageSourcePropType> = {
  midnight: require('@/assets/images/cover-midnight.jpg'),
  neon: require('@/assets/images/cover-neon.jpg'),
  dusk: require('@/assets/images/cover-dusk.jpg'),
};

export function MusicArtwork({ coverKey, size, style }: { coverKey: CoverKey; size: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.shadow, { width: size, height: size }, style]}>
      <Image source={artwork[coverKey]} style={styles.image} />
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 6,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
});