import { DropStoreModel } from '@/src/types/drop-item';

const now = new Date().toISOString();

export const seededDropData: DropStoreModel = {
  updatedAt: now,
  items: [
    {
      id: 'seed-1',
      text: 'I keep replaying that awkward moment from dinner.',
      status: 'held',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'seed-2',
      text: 'I am carrying a lot of pressure about tomorrow.',
      status: 'held',
      createdAt: now,
      updatedAt: now,
    },
  ],
};
