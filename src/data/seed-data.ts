import { DropStoreModel } from '@/src/types/drop-item';

const now = new Date().toISOString();

export const seededDropData: DropStoreModel = {
  updatedAt: now,
  items: [
    {
      id: 'seed-1',
      text: 'Email the landlord about water pressure.',
      status: 'held',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'seed-2',
      text: 'Sketch weekend meal plan.',
      status: 'resurfaced',
      createdAt: now,
      updatedAt: now,
      resurfacedAt: now,
    },
  ],
};
