import { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { appColors, radii, spacing, typography } from '@/src/theme/tokens';

export function StateShell({ title, subtitle, children }: PropsWithChildren<{ title: string; subtitle: string }>) {
  return (
    <View style={styles.shell}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

export function QuietButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: appColors.background,
    gap: spacing.sm,
  },
  title: {
    ...typography.title,
    color: appColors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: appColors.textMuted,
  },
  body: {
    marginTop: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: appColors.border,
    backgroundColor: appColors.surface,
    padding: spacing.lg,
    gap: spacing.md,
    flex: 1,
  },
  button: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: appColors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignSelf: 'flex-start',
    backgroundColor: appColors.surface,
  },
  buttonText: {
    ...typography.bodyMedium,
    color: appColors.textPrimary,
  },
});
