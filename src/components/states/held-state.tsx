import { MaterialIcons } from '@expo/vector-icons';
import { ActionSheetIOS, Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useDropItController } from '@/src/state/use-drop-it-controller';
import { appColors, radii, spacing, typography } from '@/src/theme/tokens';

type Props = ReturnType<typeof useDropItController>;

export function HeldState({ items, transitionToResurfacing, closeItem, goToCapture }: Props) {
  const heldItems = items.filter((item) => item.status === 'held');

  const showActions = (itemId: string) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'bring this back now', 'let it go'],
          cancelButtonIndex: 0,
        },
        (selectedIndex) => {
          if (selectedIndex === 1) {
            transitionToResurfacing(itemId);
          }

          if (selectedIndex === 2) {
            closeItem(itemId);
          }
        }
      );

      return;
    }

    Alert.alert('held item', 'what would you like to do?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'bring this back now', onPress: () => transitionToResurfacing(itemId) },
      { text: 'let it go', onPress: () => closeItem(itemId) },
    ]);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.headerRow}>
        <Pressable style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]} onPress={goToCapture}>
          <MaterialIcons name="arrow-back-ios-new" size={14} color={appColors.textMuted} />
          <Text style={styles.backText}>back</Text>
        </Pressable>

        <Text style={styles.title}>held</Text>
        <View style={styles.countPill}>
          <Text style={styles.count}>{heldItems.length}</Text>
        </View>
      </View>

      {heldItems.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>quiet for now</Text>
          <Text style={styles.emptyCopy}>New drops will rest here until they resurface.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {heldItems.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [styles.itemCard, pressed && styles.itemCardPressed]}
              onLongPress={() => showActions(item.id)}
              delayLongPress={250}>
              <View style={styles.stamp} />
              <Text style={styles.itemText}>{item.text}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <Text style={styles.footer}>long press an item for actions.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: appColors.background,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: spacing.xs,
    paddingRight: spacing.sm,
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  backText: {
    ...typography.caption,
    color: appColors.textMuted,
  },
  title: {
    ...typography.title,
    color: appColors.textPrimary,
    textTransform: 'lowercase',
  },
  countPill: {
    borderRadius: radii.pill,
    backgroundColor: appColors.accentSoft,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
  count: {
    ...typography.caption,
    color: appColors.textMuted,
    fontWeight: '500',
  },
  list: {
    flex: 1,
    gap: spacing.sm + 2,
  },
  itemCard: {
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: radii.lg,
    backgroundColor: appColors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  itemCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.995 }],
  },
  stamp: {
    width: 10,
    height: 10,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: appColors.accent,
    marginTop: 7,
  },
  itemText: {
    ...typography.body,
    color: appColors.textPrimary,
    flex: 1,
  },
  emptyCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: radii.lg,
    backgroundColor: appColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.xs,
  },
  emptyTitle: {
    ...typography.bodyMedium,
    color: appColors.textPrimary,
    textTransform: 'lowercase',
  },
  emptyCopy: {
    ...typography.caption,
    color: appColors.textMuted,
    textAlign: 'center',
  },
  footer: {
    ...typography.caption,
    color: appColors.textMuted,
    textTransform: 'lowercase',
  },
});
