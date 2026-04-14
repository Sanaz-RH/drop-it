import { ActionSheetIOS, Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { appColors, radii, spacing, typography } from '@/src/theme/tokens';
import { useDropItController } from '@/src/state/use-drop-it-controller';

type Props = ReturnType<typeof useDropItController>;

export function HeldState({ items, transitionToResurfacing, closeItem }: Props) {
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
        <Text style={styles.title}>held</Text>
        <Text style={styles.count}>{heldItems.length}</Text>
      </View>

      <View style={styles.list}>
        {heldItems.map((item) => (
          <Pressable
            key={item.id}
            style={styles.itemCard}
            onLongPress={() => showActions(item.id)}
            delayLongPress={250}>
            <View style={styles.stamp} />
            <Text style={styles.itemText}>{item.text}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.footer}>nothing is lost.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FAF9F7',
    borderWidth: 1,
    borderColor: '#E5E1EF',
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  title: {
    ...typography.title,
    color: '#443B64',
    textTransform: 'lowercase',
  },
  count: {
    ...typography.caption,
    color: '#7E7699',
  },
  list: {
    flex: 1,
    gap: 12,
  },
  itemCard: {
    borderWidth: 1,
    borderColor: '#E0DBEC',
    borderRadius: radii.md,
    backgroundColor: appColors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  stamp: {
    width: 10,
    height: 10,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: '#7A709C',
    marginTop: 7,
  },
  itemText: {
    ...typography.body,
    color: appColors.textPrimary,
    flex: 1,
  },
  footer: {
    ...typography.caption,
    color: appColors.textMuted,
    fontStyle: 'italic',
    fontSize: 12,
    lineHeight: 16,
  },
});
