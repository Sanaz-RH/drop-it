import { MaterialIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  Easing,
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
const SLOT_WIDTH = 130;
const SLOT_HEIGHT = 14;

export function CaptureState({
  draft,
  setDraft,
  prepareCaptureItem,
  commitCaptureTransition,
  items,
  isReady,
  onDropSuccess,
}: Props) {
  const [inputFocused, setInputFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardText, setCardText] = useState('');
  const [slotCenterY, setSlotCenterY] = useState(0);
  const [inputCenterY, setInputCenterY] = useState(0);
  const [tiltEnabled, setTiltEnabled] = useState(experiments.tiltToDrop.enabled);

  const heldCount = useMemo(() => items.filter((item) => item.status === 'held').length, [items]);

  const breath = useSharedValue(0);
  const ringScale = useSharedValue(1);
  const ringShiftY = useSharedValue(0);

  const cardY = useSharedValue(0);
  const cardScale = useSharedValue(1);
  const cardOpacity = useSharedValue(0);

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

  const ringAnimatedStyle = useAnimatedStyle(() => {
    const pulse = 1 + breath.value * 0.045;
    return {
      transform: [{ translateY: ringShiftY.value }, { scale: ringScale.value * pulse }],
    };
  });

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardY.value }, { scale: cardScale.value }],
  }));

  const onFocusChange = (focused: boolean) => {
    setInputFocused(focused);
    ringScale.value = withTiming(focused ? 0.9 : 1, { duration: 520, easing: Easing.out(Easing.cubic) });
    ringShiftY.value = withTiming(focused ? 24 : 0, { duration: 520, easing: Easing.out(Easing.cubic) });
  };

  const onSlotLayout = (event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    setSlotCenterY(y + height / 2);
  };

  const onInputLayout = (event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    setInputCenterY(y + height / 2);
  };

  const completeSubmit = useCallback((itemId: string) => {
    setIsSubmitting(false);
    setCardText('');
    onDropSuccess();
    commitCaptureTransition(itemId);
  }, [commitCaptureTransition]);

  const submit = useCallback(async () => {
    if (isSubmitting) {
      return;
    }

    const item = await prepareCaptureItem();

    if (!item) {
      return;
    }

    if (!slotCenterY || !inputCenterY) {
      onDropSuccess();
      commitCaptureTransition(item.id);
      return;
    }

    setIsSubmitting(true);
    setCardText(item.text);

    cardY.value = inputCenterY - slotCenterY;
    cardScale.value = 1;
    cardOpacity.value = 1;

    cardY.value = withTiming(0, { duration: 980, easing: Easing.inOut(Easing.cubic) });
    cardScale.value = withTiming(0.88, { duration: 980, easing: Easing.out(Easing.cubic) });
    cardOpacity.value = withDelay(
      820,
      withTiming(0, { duration: 220, easing: Easing.in(Easing.quad) }, (finished) => {
        if (finished) {
          runOnJS(completeSubmit)(item.id);
        }
      })
    );
  }, [cardOpacity, cardScale, cardY, completeSubmit, commitCaptureTransition, inputCenterY, isSubmitting, prepareCaptureItem, slotCenterY]);

  const shouldArmTiltGesture =
    tiltEnabled && isReady && !isSubmitting && !inputFocused && draft.trim().length > 0;

  useTiltToDrop({
    enabled: experiments.tiltToDrop.enabled,
    armed: shouldArmTiltGesture,
    onTrigger: submit,
  });

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <View style={styles.pill}>
          <Text style={styles.pillText}>{heldCount} held</Text>
        </View>
      </View>

      <View style={styles.centerZone}>
        <View style={styles.slotArea} onLayout={onSlotLayout}>
          <View style={styles.slot} />
        </View>

        <Animated.View style={[styles.ringsWrap, ringAnimatedStyle]}>
          <View style={[styles.ring, styles.ringOuter]} />
          <View style={[styles.ring, styles.ringMid]} />
          <View style={[styles.ring, styles.ringInner]} />
          <View style={styles.micCore}>
            <MaterialIcons name="mic-none" size={34} color={appColors.textPrimary} />
          </View>
        </Animated.View>

        <Animated.View pointerEvents="none" style={[styles.floatingCard, cardAnimatedStyle]}>
          <Text numberOfLines={2} style={styles.floatingCardText}>
            {cardText}
          </Text>
        </Animated.View>
      </View>

      <View style={styles.inputWrap} onLayout={onInputLayout}>
        {__DEV__ && experiments.tiltToDrop.enabled ? (
          <View style={styles.experimentRow}>
            <Pressable
              style={({ pressed }) => [styles.devToggle, pressed && styles.devTogglePressed]}
              onPress={() => setTiltEnabled((value) => !value)}>
              <Text style={styles.devToggleText}>Tilt-to-drop: {tiltEnabled ? 'on' : 'off'}</Text>
            </Pressable>
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
            style={({ pressed }) => [styles.sendButton, pressed && styles.sendButtonPressed]}
            onPress={submit}
            disabled={!isReady || isSubmitting}>
            <MaterialIcons name="north-east" size={16} color="#FFF" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F7FC',
  },
  topBar: {
    alignItems: 'flex-end',
    paddingTop: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.pill,
    backgroundColor: '#EEF0F8',
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
    paddingBottom: spacing.xxl,
  },
  slotArea: {
    width: SLOT_WIDTH,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  slot: {
    width: SLOT_WIDTH,
    height: SLOT_HEIGHT,
    borderRadius: radii.pill,
    backgroundColor: '#DFE3EF',
    borderWidth: 1,
    borderColor: '#D1D7E7',
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
    borderColor: '#D9DEEB',
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
  micCore: {
    width: 72,
    height: 72,
    borderRadius: radii.pill,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CFD5E6',
    backgroundColor: '#FFF',
  },
  floatingCard: {
    position: 'absolute',
    width: 190,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DADFEB',
    shadowColor: '#252C3B',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  floatingCardText: {
    ...typography.caption,
    color: appColors.textPrimary,
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
  devToggle: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: '#D8DEEE',
    backgroundColor: '#F4F6FC',
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
    borderColor: '#D9DEEB',
    backgroundColor: '#FFF',
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
});
