import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInUp,
  SlideInRight,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { StateShell } from '@/src/components/states/shared';
import { appColors, radii, spacing, typography } from '@/src/theme/tokens';
import { useDropItController } from '@/src/state/use-drop-it-controller';

type Props = ReturnType<typeof useDropItController>;

const RING_SIZE = 176;

export function FeedbackState({ activeItem, items, goToCapture, onFeedbackConfirmation }: Props) {
  const ringProgress = useSharedValue(0);
  const checkProgress = useSharedValue(0);

  const heldItems = items.filter((item) => item.status === 'held');

  useEffect(() => {
    if (activeItem?.id) {
      onFeedbackConfirmation();
    }

    ringProgress.value = 0;
    checkProgress.value = 0;

    ringProgress.value = withTiming(1, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });

    checkProgress.value = withDelay(
      760,
      withTiming(1, {
        duration: 820,
        easing: Easing.inOut(Easing.cubic),
      })
    );
  }, [activeItem?.id, checkProgress, onFeedbackConfirmation, ringProgress]);

  const outerRingStyle = useAnimatedStyle(() => ({
    opacity: interpolate(ringProgress.value, [0, 0.62, 1], [1, 0.38, 0]),
    transform: [{ scale: interpolate(ringProgress.value, [0, 1], [1, 0.86]) }],
    borderColor: interpolateColor(ringProgress.value, [0, 1], ['#C8CFDF', '#76A9FF']),
  }));

  const midRingStyle = useAnimatedStyle(() => ({
    opacity: interpolate(ringProgress.value, [0, 0.7, 1], [1, 0.42, 0]),
    transform: [{ scale: interpolate(ringProgress.value, [0, 1], [1, 0.9]) }],
    borderColor: interpolateColor(ringProgress.value, [0, 1], ['#D2D8E8', '#76A9FF']),
  }));

  const innerRingStyle = useAnimatedStyle(() => ({
    opacity: interpolate(ringProgress.value, [0, 0.78, 1], [1, 0.34, 0]),
    transform: [{ scale: interpolate(ringProgress.value, [0, 1], [1, 0.94]) }],
    borderColor: interpolateColor(ringProgress.value, [0, 1], ['#DDE2EF', '#76A9FF']),
  }));

  const confirmRingStyle = useAnimatedStyle(() => ({
    opacity: interpolate(ringProgress.value, [0.3, 1], [0, 1]),
    transform: [{ scale: interpolate(ringProgress.value, [0.3, 1], [0.84, 1]) }],
    borderColor: interpolateColor(ringProgress.value, [0, 1], ['#A0BCEB', '#4E8DFF']),
    backgroundColor: interpolateColor(ringProgress.value, [0, 1], ['rgba(136, 170, 227, 0.08)', 'rgba(78, 141, 255, 0.08)']),
  }));

  const checkStemStyle = useAnimatedStyle(() => ({
    opacity: interpolate(checkProgress.value, [0, 0.2], [0, 1]),
    transform: [
      { rotate: '-45deg' },
      { scaleX: interpolate(checkProgress.value, [0, 0.45, 1], [0, 1, 1]) },
    ],
  }));

  const checkKickStyle = useAnimatedStyle(() => ({
    opacity: interpolate(checkProgress.value, [0.2, 0.6], [0, 1]),
    transform: [
      { rotate: '40deg' },
      { scaleX: interpolate(checkProgress.value, [0.25, 1], [0, 1]) },
    ],
  }));

  return (
    <StateShell title="Received" subtitle="I'm holding it with care.">
      <View style={styles.content}>
        <View style={styles.confirmWrap}>
          <Animated.View style={[styles.ring, styles.outerRing, outerRingStyle]} />
          <Animated.View style={[styles.ring, styles.midRing, midRingStyle]} />
          <Animated.View style={[styles.ring, styles.innerRing, innerRingStyle]} />
          <Animated.View style={[styles.ring, styles.confirmRing, confirmRingStyle]} />

          <View style={styles.checkWrap}>
            <Animated.View style={[styles.checkLine, styles.checkStem, checkStemStyle]} />
            <Animated.View style={[styles.checkLine, styles.checkKick, checkKickStyle]} />
          </View>
        </View>

        <Animated.Text entering={FadeIn.delay(1120).duration(640)} style={styles.primaryCopy}>
          I'll hold this for you.
        </Animated.Text>
        <Animated.Text entering={FadeIn.delay(1720).duration(640)} style={styles.secondaryCopy}>
          you can let go.
        </Animated.Text>

        <Animated.View entering={FadeInUp.delay(2080).duration(620)} style={styles.card}>
          <Text numberOfLines={3} style={styles.cardText}>
            “{activeItem?.text ?? 'Your thought'}”
          </Text>
        </Animated.View>

        <View style={styles.dotsWrap}>
          {heldItems.map((item, index) => {
            const isNewest = item.id === activeItem?.id || index === 0;
            return (
              <Animated.View
                key={item.id}
                entering={isNewest ? SlideInRight.delay(2280).duration(420).easing(Easing.out(Easing.cubic)) : FadeIn.duration(300)}
                style={[styles.dot, isNewest && styles.dotActive]}
              />
            );
          })}
        </View>

        <Animated.View entering={FadeIn.delay(2480).duration(640)} style={styles.actionWrap}>
          <Pressable onPress={goToCapture} style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}>
            <Text style={styles.actionText}>+ drop another</Text>
          </Pressable>
        </Animated.View>
      </View>
    </StateShell>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing.md,
  },
  confirmWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  ring: {
    position: 'absolute',
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  outerRing: {
    width: RING_SIZE,
    height: RING_SIZE,
  },
  midRing: {
    width: RING_SIZE * 0.78,
    height: RING_SIZE * 0.78,
  },
  innerRing: {
    width: RING_SIZE * 0.58,
    height: RING_SIZE * 0.58,
  },
  confirmRing: {
    width: RING_SIZE * 0.78,
    height: RING_SIZE * 0.78,
    borderWidth: 1.5,
    shadowColor: '#5D8DEB',
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  checkWrap: {
    width: 58,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkLine: {
    position: 'absolute',
    height: 3,
    borderRadius: radii.pill,
    backgroundColor: '#5D8DEB',
  },
  checkStem: {
    width: 18,
    left: 15,
    top: 23,
  },
  checkKick: {
    width: 34,
    left: 23,
    top: 17,
  },
  primaryCopy: {
    ...typography.title,
    color: appColors.textPrimary,
  },
  secondaryCopy: {
    ...typography.body,
    color: appColors.textMuted,
    marginTop: spacing.xs,
  },
  card: {
    marginTop: spacing.xl,
    width: '100%',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderWidth: 1,
    borderColor: appColors.border,
    backgroundColor: appColors.surface,
    shadowColor: '#202A45',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  cardText: {
    ...typography.body,
    color: appColors.textPrimary,
  },
  dotsWrap: {
    marginTop: spacing.lg,
    minHeight: 10,
    flexDirection: 'row',
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: '#CCD5ED',
  },
  dotActive: {
    width: 18,
    backgroundColor: '#8BA2DD',
  },
  actionWrap: {
    marginTop: 'auto',
    marginBottom: spacing.sm,
  },
  actionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  actionPressed: {
    opacity: 0.74,
  },
  actionText: {
    ...typography.caption,
    color: appColors.textMuted,
  },
});
