import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { StyleSheet, Text } from 'react-native';

import { StateShell } from '@/src/components/states/shared';
import { appColors, typography } from '@/src/theme/tokens';
import { useDropItController } from '@/src/state/use-drop-it-controller';

type Props = ReturnType<typeof useDropItController>;

export function FeedbackState({ activeItem }: Props) {
  return (
    <StateShell title="Received" subtitle="The system has taken this from you.">
      <Animated.View entering={FadeIn.duration(700)} exiting={FadeOut.duration(700)}>
        <Text style={styles.text}>“{activeItem?.text ?? 'Your thought'}”</Text>
      </Animated.View>
    </StateShell>
  );
}

const styles = StyleSheet.create({
  text: {
    ...typography.bodyMedium,
    color: appColors.textPrimary,
  },
});
