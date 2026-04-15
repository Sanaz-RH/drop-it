import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActionSheetIOS, Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { StampMark, getStampLabelForItem, getStampRotationForItem } from '@/src/components/stamp-mark';
import { useDropItController } from '@/src/state/use-drop-it-controller';
import { appColors, radii, spacing, typography } from '@/src/theme/tokens';

type Props = ReturnType<typeof useDropItController>;

export function HeldState({ items, transitionToResurfacing, closeItem, goToCapture }: Props) {
  const heldItems = items.filter((item) => item.status === 'held');
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const supportsClickActions = Platform.OS === 'web';

  const runAction = (itemId: string, action: 'resurface' | 'close') => {
    if (action === 'resurface') {
      transitionToResurfacing(itemId);
      return;
    }

    closeItem(itemId);
  };

  const showActions = (itemId: string) => {
    if (supportsClickActions) {
      setActiveItemId((currentId) => (currentId === itemId ? null : itemId));
      return;
    }

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'bring this back now', 'let it go'],
          cancelButtonIndex: 0,
        },
        (selectedIndex) => {
          if (selectedIndex === 1) {
            runAction(itemId, 'resurface');
          }

          if (selectedIndex === 2) {
            runAction(itemId, 'close');
          }
        }
      );

      return;
    }

    Alert.alert('held item', 'what would you like to do?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'bring this back now', onPress: () => runAction(itemId, 'resurface') },
      { text: 'let it go', onPress: () => runAction(itemId, 'close') },
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
            <View key={item.id} style={styles.cardGroup}>
              <Pressable
                style={({ pressed, hovered, focused }) => [
                  styles.itemCard,
                  pressed && styles.itemCardPressed,
                  (hovered || focused || activeItemId === item.id) && styles.itemCardInteractive,
                ]}
                onLongPress={() => showActions(item.id)}
                onPress={supportsClickActions ? () => showActions(item.id) : undefined}
                delayLongPress={250}>
                <StampMark
                  label={getStampLabelForItem(item.id)}
                  rotation={getStampRotationForItem(item.id)}
                  style={styles.stamp}
                />
                <Text style={styles.itemText}>{item.text}</Text>
                {supportsClickActions ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Show actions for: ${item.text}`}
                    hitSlop={8}
                    style={({ pressed, hovered, focused }) => [
                      styles.menuButton,
                      (hovered || focused || pressed) && styles.menuButtonInteractive,
                    ]}
                    onPress={(event) => {
                      event.stopPropagation();
                      showActions(item.id);
                    }}>
                    <MaterialIcons name="more-horiz" size={18} color={appColors.textMuted} />
                  </Pressable>
                ) : null}
              </Pressable>

              {supportsClickActions && activeItemId === item.id ? (
                <View style={styles.inlineActions}>
                  <Pressable
                    accessibilityRole="button"
                    style={({ pressed, hovered, focused }) => [
                      styles.actionButton,
                      (pressed || hovered || focused) && styles.actionButtonInteractive,
                    ]}
                    onPress={() => runAction(item.id, 'resurface')}>
                    <Text style={styles.actionText}>bring this back now</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    style={({ pressed, hovered, focused }) => [
                      styles.actionButton,
                      (pressed || hovered || focused) && styles.actionButtonInteractive,
                    ]}
                    onPress={() => runAction(item.id, 'close')}>
                    <Text style={styles.actionText}>let it go</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          ))}
        </View>
      )}

      <Text style={styles.footer}>
        {supportsClickActions ? 'click an item (or •••) for actions.' : 'long press an item for actions.'}
      </Text>
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
  cardGroup: {
    gap: spacing.xs,
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
  itemCardInteractive: {
    borderColor: appColors.textMuted,
  },
  itemCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.995 }],
  },
  stamp: {
    width: 58,
    height: 58,
    marginTop: spacing.xs,
    marginLeft: -2,
    flexShrink: 0,
  },
  itemText: {
    ...typography.body,
    color: appColors.textPrimary,
    flex: 1,
  },
  menuButton: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'transparent',
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -2,
  },
  menuButtonInteractive: {
    backgroundColor: appColors.accentSoft,
    borderColor: appColors.border,
  },
  inlineActions: {
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'flex-end',
    paddingRight: spacing.xs,
  },
  actionButton: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: appColors.border,
    backgroundColor: appColors.surface,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
  actionButtonInteractive: {
    borderColor: appColors.textMuted,
    backgroundColor: appColors.accentSoft,
  },
  actionText: {
    ...typography.caption,
    color: appColors.textPrimary,
    textTransform: 'lowercase',
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
