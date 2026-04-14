import * as FileSystem from 'expo-file-system/legacy';

import { seededDropData } from '@/src/data/seed-data';
import { DropStoreModel } from '@/src/types/drop-item';

const STORAGE_PATH = `${FileSystem.documentDirectory}drop-it-store.json`;

export async function loadDropStore(): Promise<DropStoreModel> {
  const info = await FileSystem.getInfoAsync(STORAGE_PATH);

  if (!info.exists) {
    await saveDropStore(seededDropData);
    return seededDropData;
  }

  const json = await FileSystem.readAsStringAsync(STORAGE_PATH);

  if (!json) {
    return seededDropData;
  }

  return JSON.parse(json) as DropStoreModel;
}

export async function saveDropStore(store: DropStoreModel): Promise<void> {
  await FileSystem.writeAsStringAsync(STORAGE_PATH, JSON.stringify(store));
}
