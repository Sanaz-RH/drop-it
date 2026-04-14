import { SafeAreaView, StyleSheet, View } from 'react-native';

import { CaptureState } from '@/src/components/states/capture-state';
import { ClosureState } from '@/src/components/states/closure-state';
import { FeedbackState } from '@/src/components/states/feedback-state';
import { HeldState } from '@/src/components/states/held-state';
import { ResurfacingState } from '@/src/components/states/resurfacing-state';
import { appColors, radii, spacing } from '@/src/theme/tokens';
import { AppStateName, useDropItController } from '@/src/state/use-drop-it-controller';

const stateComponents: Record<AppStateName, React.ComponentType<ReturnType<typeof useDropItController>>> = {
  capture: CaptureState,
  feedback: FeedbackState,
  held: HeldState,
  resurfacing: ResurfacingState,
  closure: ClosureState,
};

export default function DropItApp() {
  const controller = useDropItController();
  const CurrentState = stateComponents[controller.state];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <CurrentState {...controller} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: appColors.background,
  },
  container: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: radii.xl,
  },
});
