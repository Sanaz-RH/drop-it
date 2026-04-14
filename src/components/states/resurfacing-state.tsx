import { Text } from 'react-native';

import { QuietButton, StateShell } from '@/src/components/states/shared';
import { appColors, typography } from '@/src/theme/tokens';
import { useDropItController } from '@/src/state/use-drop-it-controller';

type Props = ReturnType<typeof useDropItController>;

export function ResurfacingState({ activeItem, closeItem }: Props) {
  return (
    <StateShell title="Resurfacing" subtitle="This thought is ready to be seen again.">
      <Text style={{ ...typography.body, color: appColors.textPrimary }}>{activeItem?.text ?? 'No active item yet.'}</Text>
      {activeItem ? <QuietButton label="Close" onPress={() => closeItem(activeItem.id)} /> : null}
    </StateShell>
  );
}
