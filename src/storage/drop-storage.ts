import { File, Paths } from 'expo-file-system';

import { seededDropData } from '@/src/data/seed-data';
import { DropStoreModel } from '@/src/types/drop-item';

const STORAGE_FILE = new File(Paths.document, 'drop-it-store.json');

export async function loadDropStore(): Promise<DropStoreModel> {
  if (!STORAGE_FILE.exists) {
    await saveDropStore(seededDropData);
    return seededDropData;
  }

  const json = await STORAGE_FILE.text();

  if (!json) {
    return seededDropData;
  }

  return JSON.parse(json) as DropStoreModel;
}

export async function saveDropStore(store: DropStoreModel): Promise<void> {
  if (!STORAGE_FILE.exists) {
    STORAGE_FILE.create();
  }

  STORAGE_FILE.write(JSON.stringify(store));
}
