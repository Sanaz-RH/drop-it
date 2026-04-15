import { MaterialIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { experiments } from '@/src/config/experiments';
import { useTiltToDrop } from '@/src/experiments/use-tilt-to-drop';
import { useDropItController } from '@/src/state/use-drop-it-controller';
import { appColors, radii, spacing, typography } from '@/src/theme/tokens';

type Props = ReturnType<typeof useDropItController>;

const RING_SIZE = 220;
const MAX_ANIMATED_WORDS = 18;
const CENTER_RECEIVER_WIDTH = 114;
const CENTER_RECEIVER_HEIGHT = 70;
const TWO_PI = Math.PI * 2;

function WordVortexParticle({
  word,
  index,
  total,
  progress,
}: {
  word: string;
  index: number;
  total: number;
  progress: Animated.SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const settle = Math.min(p / 0.72, 1);
    const pull = p <= 0.72 ? 0 : Math.min((p - 0.72) / 0.28, 1);

    const baseRadius = 92 + ((index % 4) * 11);
    const swirlTurns = 1.4 + index * 0.035;
    const angle = settle * swirlTurns * TWO_PI + (index / Math.max(total, 1)) * TWO_PI;
    const radius = interpolate(settle, [0, 1], [baseRadius, 44]);

    const x = Math.cos(angle) * radius * (1 - pull * 0.92);
    const yOrbit = Math.sin(angle) * radius * 0.42;
    const yLift = interpolate(settle, [0, 1], [124 + (index % 3) * 8, yOrbit - 4]);
    const y = yLift * (1 - pull) + interpolate(pull, [0, 1], [0, -1]);

    const scale = interpolate(p, [0, 0.72, 1], [1.01, 0.96, 0.72]);
    const opacity = interpolate(p, [0, 0.1, 0.84, 0.96, 1], [0, 1, 1, 0.36, 0]);

    return {
      opacity,
      transform: [{ translateX: x }, { translateY: y }, { scale }],
    };
  });

  return <Animated.Text style={[styles.wordParticle, animatedStyle]}>{word}</Animated.Text>;
}

export function CaptureState({
  draft,
  setDraft,
  prepareCaptureItem,
  commitCaptureTransition,
  items,
  isReady,
  onDropSuccess,
  resurfaceNow,
  canResurfaceNow,
}: Props) {
  const [inputFocused, setInputFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [words, setWords] = useState<string[]>([]);
  const [tiltEnabled, setTiltEnabled] = useState(experiments.tiltToDrop.enabled);
  const [isListening, setIsListening] = useState(false);

  const heldCount = useMemo(() => items.filter((item) => item.status === 'held').length, [items]);

  const breath = useSharedValue(0);
  const ringScale = useSharedValue(1);
  const ringShiftY = useSharedValue(0);

  const dropProgress = useSharedValue(0);
  const tornadoOpacity = useSharedValue(0);
  const slotOpen = useSharedValue(0);
  const micRipple = useSharedValue(0);

  useEffect(() => {
    breath.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [breath]);

  useEffect(() => {
    if (!isListening) {
      micRipple.value = withTiming(0, { duration: 260, easing: Easing.out(Easing.quad) });
      return;
    }

    micRipple.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 920, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 920, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, [isListening, micRipple]);

  const ringAnimatedStyle = useAnimatedStyle(() => {
    const pulse = 1 + breath.value * 0.045;
    return {
      transform: [{ translateY: ringShiftY.value }, { scale: ringScale.value * pulse }],
    };
  });

  const tornadoStyle = useAnimatedStyle(() => ({
    opacity: tornadoOpacity.value,
  }));

  const slotCapStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 600 },
      { translateY: interpolate(slotOpen.value, [0, 1], [0, -8]) },
      { rotateX: `${interpolate(slotOpen.value, [0, 1], [0, -56])}deg` },
    ],
    opacity: interpolate(slotOpen.value, [0, 1], [1, 0.92]),
  }));

  const slotGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(slotOpen.value, [0, 1], [0.08, 0.4]),
    transform: [{ scale: interpolate(slotOpen.value, [0, 1], [0.86, 1.04]) }],
  }));

  const receiverInnerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(slotOpen.value, [0, 1], [0.05, 0.4]),
    transform: [{ scaleY: interpolate(slotOpen.value, [0, 1], [0.78, 1]) }],
  }));

  const micRippleOuterStyle = useAnimatedStyle(() => ({
    opacity: interpolate(micRipple.value, [0, 1], [0, 0.35]),
    transform: [{ scale: interpolate(micRipple.value, [0, 1], [0.85, 1.2]) }],
  }));

  const micRippleInnerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(micRipple.value, [0, 1], [0.18, 0.46]),
    transform: [{ scale: interpolate(micRipple.value, [0, 1], [0.9, 1.1]) }],
  }));

  const onFocusChange = (focused: boolean) => {
    setInputFocused(focused);
    ringScale.value = withTiming(focused ? 0.92 : 1, { duration: 440, easing: Easing.out(Easing.cubic) });
    ringShiftY.value = withTiming(focused ? 20 : 0, { duration: 440, easing: Easing.out(Easing.cubic) });
  };

  const completeSubmit = useCallback(
    (itemId: string) => {
      setIsSubmitting(false);
      setWords([]);
      tornadoOpacity.value = 0;
      slotOpen.value = 0;
      onDropSuccess();
      commitCaptureTransition(itemId);
    },
    [commitCaptureTransition, onDropSuccess, slotOpen, tornadoOpacity]
  );

  const submit = useCallback(async () => {
    if (isSubmitting) {
      return;
    }

    const item = await prepareCaptureItem();

    if (!item) {
      return;
    }

    setIsSubmitting(true);
    setIsListening(false);

    const splitWords = item.text
      .split(/\s+/)
      .map((word) => word.trim())
      .filter(Boolean)
      .slice(0, MAX_ANIMATED_WORDS);

    setWords(splitWords.length > 0 ? splitWords : ['...']);

    dropProgress.value = 0;
    tornadoOpacity.value = 1;
    slotOpen.value = 0;

    dropProgress.value = withTiming(1, { duration: 3520, easing: Easing.inOut(Easing.quad) });
    slotOpen.value = withDelay(
      620,
      withSequence(
        withTiming(1, { duration: 480, easing: Easing.out(Easing.cubic) }),
        withDelay(1700, withTiming(0, { duration: 440, easing: Easing.inOut(Easing.cubic) }))
      )
    );

    tornadoOpacity.value = withDelay(
      3520,
      withTiming(0, { duration: 260, easing: Easing.in(Easing.quad) }, (finished) => {
        if (finished) {
          runOnJS(completeSubmit)(item.id);
        }
      })
    );
  }, [
    completeSubmit,
    dropProgress,
    isSubmitting,
    prepareCaptureItem,
    slotOpen,
    tornadoOpacity,
  ]);

  const shouldArmTiltGesture =
    tiltEnabled && isReady && !isSubmitting && !inputFocused && draft.trim().length > 0;

  useTiltToDrop({
    enabled: tiltEnabled,
    armed: shouldArmTiltGesture,
    onTrigger: submit,
  });

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable
          disabled={!canResurfaceNow || !isReady}
          onPress={resurfaceNow}
          style={({ pressed }) => [
            styles.resurfacePill,
            (!canResurfaceNow || !isReady) && styles.resurfacePillDisabled,
            pressed && canResurfaceNow && styles.resurfacePillPressed,
          ]}>
          <Text style={styles.resurfacePillText}>resurface now</Text>
        </Pressable>

        <View style={styles.pill}>
          <Text style={styles.pillText}>{heldCount} held</Text>
        </View>
      </View>

      <View style={styles.centerZone}>
        <Animated.View style={[styles.ringsWrap, ringAnimatedStyle]}>
          <View style={[styles.ring, styles.ringOuter]} />
          <View style={[styles.ring, styles.ringMid]} />
          <View style={[styles.ring, styles.ringInner]} />

          <Animated.View pointerEvents="none" style={[styles.tornadoLayer, tornadoStyle]}>
            {words.map((word, index) => (
              <WordVortexParticle
                key={`${word}-${index}`}
                word={word}
                index={index}
                total={words.length}
                progress={dropProgress}
              />
            ))}
          </Animated.View>

          <Animated.View style={[styles.receiverGlow, slotGlowStyle]} />
          <Animated.View style={styles.receiverShell}>
            <Animated.View style={[styles.receiverInner, receiverInnerStyle]} />
            <View style={styles.receiverLip} />
            <Animated.View style={[styles.receiverFlap, slotCapStyle]} />
          </Animated.View>
        </Animated.View>
      </View>

      <View style={styles.inputWrap}>
        {__DEV__ && experiments.tiltToDrop.enabled ? (
          <View style={styles.experimentRow}>
            <View style={styles.devButtonRow}>
              <Pressable
                style={({ pressed }) => [styles.devToggle, pressed && styles.devTogglePressed]}
                onPress={() => setTiltEnabled((value) => !value)}>
                <Text style={styles.devToggleText}>Tilt: {tiltEnabled ? 'on' : 'off'}</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.devToggle, pressed && styles.devTogglePressed]}
                onPress={() => setDraft('I keep rehearsing this conversation in my head.')}>
                <Text style={styles.devToggleText}>Fill draft</Text>
              </Pressable>
            </View>
            {tiltEnabled ? <Text style={styles.hintText}>tilt phone forward to release</Text> : null}
          </View>
        ) : null}

        <View style={[styles.inputBar, inputFocused && styles.inputBarFocused]}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            onFocus={() => onFocusChange(true)}
            onBlur={() => onFocusChange(false)}
            editable={isReady && !isSubmitting}
            placeholder="what’s on your mind..."
            placeholderTextColor={appColors.textMuted}
            returnKeyType="send"
            onSubmitEditing={submit}
          />

          <Pressable
            onPress={() => setIsListening((value) => !value)}
            disabled={!isReady || isSubmitting}
            style={({ pressed }) => [
              styles.micButton,
              isListening && styles.micButtonActive,
              pressed && styles.micButtonPressed,
            ]}>
            <Animated.View pointerEvents="none" style={[styles.micRippleRing, styles.micRippleOuter, micRippleOuterStyle]} />
            <Animated.View pointerEvents="none" style={[styles.micRippleRing, styles.micRippleInner, micRippleInnerStyle]} />
            <MaterialIcons
              name={isListening ? 'graphic-eq' : 'mic-none'}
              size={18}
              color={isListening ? '#2F5BD8' : appColors.textPrimary}
            />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.sendButton, pressed && styles.sendButtonPressed]}
            onPress={submit}
            disabled={!isReady || isSubmitting}>
            <MaterialIcons name="north-east" size={16} color="#FFF" />
          </Pressable>
        </View>

        {isListening ? <Text style={styles.listeningHint}>listening… (prototype)</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: appColors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  resurfacePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: appColors.border,
    backgroundColor: appColors.surface,
  },
  resurfacePillDisabled: {
    opacity: 0.45,
  },
  resurfacePillPressed: {
    opacity: 0.78,
  },
  resurfacePillText: {
    ...typography.caption,
    color: appColors.textMuted,
    fontWeight: '500',
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.pill,
    backgroundColor: appColors.accentSoft,
  },
  pillText: {
    ...typography.caption,
    color: appColors.textPrimary,
    fontWeight: '500',
  },
  centerZone: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: spacing.xxxl,
  },
  ringsWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: appColors.border,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  ringOuter: {
    width: RING_SIZE,
    height: RING_SIZE,
  },
  ringMid: {
    width: RING_SIZE * 0.74,
    height: RING_SIZE * 0.74,
  },
  ringInner: {
    width: RING_SIZE * 0.5,
    height: RING_SIZE * 0.5,
  },
  receiverGlow: {
    position: 'absolute',
    width: CENTER_RECEIVER_WIDTH + 14,
    height: CENTER_RECEIVER_HEIGHT - 16,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(139, 165, 235, 0.35)',
  },
  receiverShell: {
    position: 'absolute',
    width: CENTER_RECEIVER_WIDTH,
    height: CENTER_RECEIVER_HEIGHT,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C8D2EA',
    backgroundColor: '#F7F9FF',
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  receiverInner: {
    position: 'absolute',
    left: 8,
    right: 8,
    top: 24,
    bottom: 8,
    borderRadius: 10,
    backgroundColor: '#DDE6FA',
  },
  receiverLip: {
    marginTop: 22,
    width: CENTER_RECEIVER_WIDTH - 24,
    height: 7,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: '#C8D2EA',
    backgroundColor: '#EDF2FF',
  },
  receiverFlap: {
    position: 'absolute',
    top: 8,
    width: CENTER_RECEIVER_WIDTH - 16,
    height: 24,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C1CEE9',
    backgroundColor: '#E9EEFB',
  },
  tornadoLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordParticle: {
    position: 'absolute',
    ...typography.caption,
    color: appColors.textPrimary,
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  inputWrap: {
    paddingBottom: spacing.lg,
    gap: spacing.xs,
  },
  experimentRow: {
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xs,
  },
  devButtonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  devToggle: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: appColors.border,
    backgroundColor: appColors.surfaceSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  devTogglePressed: {
    opacity: 0.86,
  },
  devToggleText: {
    ...typography.caption,
    color: appColors.textPrimary,
    fontWeight: '500',
  },
  hintText: {
    ...typography.caption,
    color: appColors.textMuted,
  },
  inputBar: {
    minHeight: 56,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: appColors.border,
    backgroundColor: '#FFF',
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  inputBarFocused: {
    borderColor: '#BCC5DE',
  },
  input: {
    flex: 1,
    ...typography.body,
    color: appColors.textPrimary,
    paddingVertical: spacing.md,
  },
  micButton: {
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: appColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    overflow: 'hidden',
  },
  micButtonActive: {
    borderColor: '#9AB0EA',
    backgroundColor: '#F2F6FF',
  },
  micButtonPressed: {
    opacity: 0.8,
  },
  micRippleRing: {
    position: 'absolute',
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: '#A3B8F4',
  },
  micRippleOuter: {
    width: 34,
    height: 34,
  },
  micRippleInner: {
    width: 26,
    height: 26,
  },
  sendButton: {
    width: 30,
    height: 30,
    borderRadius: radii.pill,
    backgroundColor: appColors.textPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonPressed: {
    opacity: 0.85,
  },
  listeningHint: {
    ...typography.caption,
    color: appColors.textMuted,
    textAlign: 'center',
  },
});
