import { useEffect } from 'react';
import {
  runOnJS,
  SensorType,
  useAnimatedReaction,
  useAnimatedSensor,
  useSharedValue,
} from 'react-native-reanimated';

type TiltToDropParams = {
  enabled: boolean;
  armed: boolean;
  onTrigger: () => void;
};

const SENSOR_INTERVAL_MS = 120;
const FORWARD_TILT_DELTA_RAD = 0.45;
const TRIGGER_COOLDOWN_MS = 1400;

/**
 * Experimental gesture: tilting the device forward can trigger the drop flow.
 * This hook is intentionally self-contained for easy A/B removal.
 */
export function useTiltToDrop({ enabled, armed, onTrigger }: TiltToDropParams) {
  const rotation = useAnimatedSensor(SensorType.ROTATION, {
    interval: SENSOR_INTERVAL_MS,
  });

  const isArmed = useSharedValue(false);
  const baselinePitch = useSharedValue<number | null>(null);
  const lastTriggerAtMs = useSharedValue(0);

  useEffect(() => {
    isArmed.value = enabled && armed;
  }, [armed, enabled, isArmed]);

  useAnimatedReaction(
    () => ({
      armed: isArmed.value,
      pitch: rotation.sensor.value.pitch,
    }),
    (current) => {
      if (!current.armed) {
        baselinePitch.value = null;
        return;
      }

      if (baselinePitch.value === null) {
        baselinePitch.value = current.pitch;
        return;
      }

      const tiltDelta = current.pitch - baselinePitch.value;
      const now = Date.now();

      if (tiltDelta >= FORWARD_TILT_DELTA_RAD && now - lastTriggerAtMs.value > TRIGGER_COOLDOWN_MS) {
        lastTriggerAtMs.value = now;
        baselinePitch.value = current.pitch;
        runOnJS(onTrigger)();
      }
    },
    [onTrigger]
  );
}
