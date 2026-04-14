import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { appColors, radii, spacing, typography } from '@/src/theme/tokens';
import { useDropItController } from '@/src/state/use-drop-it-controller';

type Props = ReturnType<typeof useDropItController>;

const CARD_DROP_MS = 840;
const SHREDDER_FADE_MS = 360;
const GONE_FADE_MS = 500;
const HOLD_MS = 1400;
const STRIP_COUNT = 9;

export function ClosureState({ activeItem, completeClosure, onClosureSound, onClosureComplete }: Props) {
  const cardProgress = useRef(new Animated.Value(0)).current;
  const shredderOpacity = useRef(new Animated.Value(1)).current;
  const goneOpacity = useRef(new Animated.Value(0)).current;
  const [showStrips, setShowStrips] = useState(false);

  const strips = useMemo(
    () =>
      Array.from({ length: STRIP_COUNT }, (_, index) => {
        const seed = index + 3;
        const horizontalOffset = (seed * 13) % 34 - 17;
        const fallDistance = 22 + ((seed * 19) % 40);
        const sway = (seed * 11) % 12 - 6;
        const delay = (seed * 57) % 210;
        const duration = 420 + ((seed * 41) % 280);
        return { id: `strip-${index}`, horizontalOffset, fallDistance, sway, delay, duration };
      }),
    []
  );

  useEffect(() => {
    if (!activeItem) {
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];

    onClosureSound();

    const run = Animated.sequence([
      Animated.timing(cardProgress, {
        toValue: 1,
        duration: CARD_DROP_MS,
        easing: Easing.bezier(0.2, 0.9, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.timing(shredderOpacity, {
        toValue: 0,
        duration: SHREDDER_FADE_MS,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(goneOpacity, {
        toValue: 1,
        duration: GONE_FADE_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.delay(HOLD_MS),
    ]);

    timers.push(setTimeout(() => setShowStrips(true), 120));

    run.start(({ finished }) => {
      if (finished) {
        onClosureComplete();
        completeClosure(activeItem.id);
      }
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      run.stop();
    };
  }, [activeItem, cardProgress, completeClosure, goneOpacity, onClosureComplete, onClosureSound, shredderOpacity]);

  const cardTranslateY = cardProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 178],
  });

  const cardScale = cardProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.9],
  });

  const cardOpacity = cardProgress.interpolate({
    inputRange: [0, 0.9, 1],
    outputRange: [1, 1, 0],
  });

  return (
    <View style={styles.screen}>
      <View style={styles.stage}>
        <Animated.View
          style={[
            styles.itemCard,
            {
              opacity: cardOpacity,
              transform: [{ translateY: cardTranslateY }, { scale: cardScale }],
            },
          ]}>
          <Text style={styles.itemText}>{activeItem?.text ?? ''}</Text>
        </Animated.View>

        <Animated.View style={[styles.shredderWrap, { opacity: shredderOpacity }]}>
          <View style={styles.shredderTop}>
            <View style={styles.slot} />
          </View>
          <View style={styles.shredderBody} />

          {showStrips && (
            <View style={styles.stripsRow}>
              {strips.map((strip) => (
                <ShredStrip key={strip.id} {...strip} />
              ))}
            </View>
          )}
        </Animated.View>
      </View>

      <Animated.View style={[styles.goneWrap, { opacity: goneOpacity }]}>
        <Text style={styles.goneText}>gone.</Text>
        <Text style={styles.freeText}>you&apos;re free of this.</Text>
      </Animated.View>
    </View>
  );
}

function ShredStrip({
  horizontalOffset,
  fallDistance,
  sway,
  delay,
  duration,
}: {
  horizontalOffset: number;
  fallDistance: number;
  sway: number;
  delay: number;
  duration: number;
}) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(progress, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: duration - 80,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [delay, duration, progress]);

  return (
    <Animated.View
      style={[
        styles.strip,
        {
          transform: [
            { translateX: horizontalOffset + progress.interpolate({ inputRange: [0, 1], outputRange: [0, sway] }) },
            { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, fallDistance] }) },
          ],
          opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.9] }),
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: appColors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  stage: {
    width: '100%',
    alignItems: 'center',
    minHeight: 340,
    justifyContent: 'center',
  },
  itemCard: {
    width: '88%',
    maxWidth: 340,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: appColors.border,
    backgroundColor: appColors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#232C40',
    shadowOpacity: 0.08,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  itemText: {
    ...typography.body,
    color: appColors.textPrimary,
    textAlign: 'center',
  },
  shredderWrap: {
    alignItems: 'center',
    marginTop: -spacing.sm,
  },
  shredderTop: {
    width: 192,
    height: 42,
    borderRadius: radii.lg,
    backgroundColor: '#C7D1EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slot: {
    width: 114,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: '#7A86A7',
  },
  shredderBody: {
    width: 168,
    height: 62,
    borderBottomLeftRadius: radii.lg,
    borderBottomRightRadius: radii.lg,
    backgroundColor: '#E0E7F6',
    marginTop: -1,
  },
  stripsRow: {
    position: 'absolute',
    top: 94,
    flexDirection: 'row',
    gap: 8,
  },
  strip: {
    width: 6,
    height: 34,
    borderRadius: radii.sm,
    backgroundColor: '#C3D0E8',
  },
  goneWrap: {
    position: 'absolute',
    alignItems: 'center',
    bottom: 128,
  },
  goneText: {
    ...typography.title,
    color: '#414B68',
    textTransform: 'lowercase',
  },
  freeText: {
    marginTop: spacing.xs,
    color: '#727A94',
    fontSize: 11,
    lineHeight: 16,
    fontStyle: 'italic',
  },
});
