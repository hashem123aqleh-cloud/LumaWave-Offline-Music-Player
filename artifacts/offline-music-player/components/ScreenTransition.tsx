import { PropsWithChildren } from 'react';
import { View } from 'react-native';

export function ScreenTransition({ children }: PropsWithChildren) {
  return <View style={{ flex: 1 }}>{children}</View>;
}