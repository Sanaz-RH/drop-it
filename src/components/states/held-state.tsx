import { StyleSheet, Text, View } from 'react-native';

import { QuietButton, StateShell } from '@/src/components/states/shared';
import { appColors, typography } from '@/src/theme/tokens';
import { useDropItController } from '@/src/state/use-drop-it-controller';

type Props = ReturnType<typeof useDropItController>;

export function HeldState({ items, transitionToResurfacing, goToCapture }: Props) {
  const heldItems = items.filter((item) => item.status === 'held');

  return (
    <StateShell title="Held" subtitle="Your dropped thoughts are safe here.">
      <View style={styles.list}>
        {heldItems.slice(0, 3).map((item) => (
          <View key={item.id} style={styles.item}>
            <Text style={styles.itemText}>{item.text}</Text>
            <QuietButton label="Resurface" onPress={() => transitionToResurfacing(item.id)} />
          </View>
        ))}
      </View>
      <QuietButton label="Capture another" onPress={goToCapture} />
    </StateShell>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  item: {
    gap: 8,
  },
  itemText: {
    ...typography.body,
    color: appColors.textPrimary,
  },
});
