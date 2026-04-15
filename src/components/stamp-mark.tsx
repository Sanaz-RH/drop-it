import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { radii, typography } from '@/src/theme/tokens';

const STAMP_LABELS = ['HELD', 'RECEIVED', 'SAVED'] as const;
const STAMP_ROTATIONS = [-12, -8, -5, 5, 8, 12] as const;

function hashString(value: string) {
  return value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

export function getStampLabelForItem(id?: string) {
  if (!id) {
    return STAMP_LABELS[0];
  }

  return STAMP_LABELS[hashString(id) % STAMP_LABELS.length];
}

export function getStampRotationForItem(id?: string) {
  if (!id) {
    return STAMP_ROTATIONS[1];
  }

  return STAMP_ROTATIONS[hashString(id) % STAMP_ROTATIONS.length];
}

type StampMarkProps = {
  label: string;
  size?: 'small' | 'large';
  rotation?: number;
  style?: StyleProp<ViewStyle>;
  animatedStyle?: StyleProp<ViewStyle>;
};

export function StampMark({ label, size = 'small', rotation = -8, style, animatedStyle }: StampMarkProps) {
  const isSmall = size === 'small';

  return (
    <Animated.View
      style={[
        styles.base,
        isSmall ? styles.smallBase : styles.largeBase,
        { transform: [{ rotate: `${rotation}deg` }] },
        style,
        animatedStyle,
      ]}>
      <View style={[styles.ring, isSmall ? styles.smallRing : styles.largeRing]} />
      <View style={[styles.innerRing, isSmall ? styles.smallInnerRing : styles.largeInnerRing]} />
      <Text style={[styles.label, isSmall ? styles.smallLabel : styles.largeLabel]}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: 'rgba(98, 105, 178, 0.42)',
    backgroundColor: 'rgba(126, 135, 206, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  smallBase: {
    width: 76,
    height: 76,
  },
  largeBase: {
    width: 126,
    height: 126,
  },
  ring: {
    position: 'absolute',
    borderRadius: radii.pill,
    borderWidth: 1.2,
    borderColor: 'rgba(85, 96, 176, 0.32)',
  },
  smallRing: {
    width: 62,
    height: 62,
  },
  largeRing: {
    width: 102,
    height: 102,
  },
  innerRing: {
    position: 'absolute',
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(72, 83, 164, 0.26)',
  },
  smallInnerRing: {
    width: 44,
    height: 44,
  },
  largeInnerRing: {
    width: 74,
    height: 74,
  },
  label: {
    ...typography.caption,
    color: 'rgba(71, 81, 160, 0.72)',
    letterSpacing: 1.8,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  smallLabel: {
    fontSize: 10,
    lineHeight: 12,
  },
  largeLabel: {
    fontSize: 14,
    lineHeight: 18,
  },
});
