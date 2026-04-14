import AsyncStorage from '@react-native-async-storage/async-storage';

import { seededDropData } from '@/src/data/seed-data';
import { DropStoreModel } from '@/src/types/drop-item';

const STORAGE_KEY = 'drop-it-store';

export async function loadDropStore(): Promise<DropStoreModel> {
  const json = await AsyncStorage.getItem(STORAGE_KEY);

  if (!json) {
    await saveDropStore(seededDropData);
    return seededDropData;
  }

  return JSON.parse(json) as DropStoreModel;
}

export async function saveDropStore(store: DropStoreModel): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}
