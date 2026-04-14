import { Text } from 'react-native';

import { QuietButton, StateShell } from '@/src/components/states/shared';
import { appColors, typography } from '@/src/theme/tokens';
import { useDropItController } from '@/src/state/use-drop-it-controller';

type Props = ReturnType<typeof useDropItController>;

export function ClosureState({ goToCapture }: Props) {
  return (
    <StateShell title="Closure" subtitle="Done. You can let this go now.">
      <Text style={{ ...typography.body, color: appColors.textPrimary }}>Placeholder state for later completion animation.</Text>
      <QuietButton label="Back to capture" onPress={goToCapture} />
    </StateShell>
  );
}
