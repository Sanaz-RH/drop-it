import { StyleSheet, Text, TextInput, View } from 'react-native';

import { QuietButton, StateShell } from '@/src/components/states/shared';
import { appColors, radii, spacing, typography } from '@/src/theme/tokens';
import { useDropItController } from '@/src/state/use-drop-it-controller';

type Props = ReturnType<typeof useDropItController>;

export function CaptureState({ draft, setDraft, addItem, items, isReady }: Props) {
  return (
    <StateShell title="Drop It" subtitle="Capture a thought. Let the system hold it.">
      <TextInput
        style={styles.input}
        value={draft}
        onChangeText={setDraft}
        editable={isReady}
        placeholder="What would you like to drop?"
        placeholderTextColor={appColors.textMuted}
      />
      <QuietButton label="Drop" onPress={addItem} />
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>Held items: {items.filter((item) => item.status === 'held').length}</Text>
      </View>
    </StateShell>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    minHeight: 52,
    ...typography.body,
    color: appColors.textPrimary,
  },
  metaRow: {
    marginTop: 'auto',
  },
  metaText: {
    ...typography.caption,
    color: appColors.textMuted,
  },
});
