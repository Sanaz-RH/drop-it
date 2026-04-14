import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

import { appColors, radii, spacing, typography } from '@/src/theme/tokens';
import { useDropItController } from '@/src/state/use-drop-it-controller';

type Props = ReturnType<typeof useDropItController>;

const OVERLAY_ANIMATION_MS = 600;

export function ResurfacingState({ activeItem, dismissResurfacedItem, closeItem }: Props) {
  const progress = useRef(new Animated.Value(0)).current;
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: OVERLAY_ANIMATION_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [progress]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [64, 0],
  });

  const backdropOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.18],
  });

  const canAct = useMemo(() => !!activeItem && !isAnimatingOut, [activeItem, isAnimatingOut]);

  const animateOut = (onComplete: () => void) => {
    setIsAnimatingOut(true);
    Animated.timing(progress, {
      toValue: 0,
      duration: OVERLAY_ANIMATION_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      setIsAnimatingOut(false);
      if (finished) {
        onComplete();
      }
    });
  };

  const handleLater = () => {
    if (!activeItem || isAnimatingOut) {
      return;
    }

    animateOut(() => {
      dismissResurfacedItem(activeItem.id);
    });
  };

  const handleDone = () => {
    if (!activeItem || isAnimatingOut) {
      return;
    }

    closeItem(activeItem.id);
  };

  return (
    <View style={styles.screen}>
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>        <Text style={styles.nowLabel}>NOW</Text>
        <Text style={styles.itemText}>{activeItem?.text ?? 'No active item yet.'}</Text>
        <Text style={styles.reassurance}>I brought this back.</Text>

        <View style={styles.buttonRow}>
          <Pressable
            accessibilityRole="button"
            disabled={!canAct}
            onPress={handleLater}
            style={[styles.button, styles.laterButton, !canAct && styles.buttonDisabled]}>
            <Text style={styles.laterText}>later</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={!canAct}
            onPress={handleDone}
            style={[styles.button, styles.doneButton, !canAct && styles.buttonDisabled]}>
            <Text style={styles.doneText}>done</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1B1828',
  },
  sheet: {
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderLeftWidth: 4,
    borderLeftColor: '#4E9B72',
    borderWidth: 1,
    borderColor: '#CBE6D8',
    backgroundColor: '#F3FBF6',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  nowLabel: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: '#3D8B65',
    fontWeight: '600',
  },
  itemText: {
    ...typography.body,
    color: '#173326',
  },
  reassurance: {
    ...typography.caption,
    color: '#4A6A59',
    fontStyle: 'italic',
  },
  buttonRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  laterButton: {
    backgroundColor: '#E5F2EA',
    borderWidth: 1,
    borderColor: '#C3DFCF',
  },
  doneButton: {
    backgroundColor: '#4E9B72',
  },
  laterText: {
    ...typography.bodyMedium,
    color: '#29563F',
    textTransform: 'lowercase',
  },
  doneText: {
    ...typography.bodyMedium,
    color: appColors.surface,
    textTransform: 'lowercase',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
