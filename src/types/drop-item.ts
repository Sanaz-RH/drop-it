export type DropItemStatus = 'held' | 'resurfaced' | 'closed';

export type DropItem = {
  id: string;
  text: string;
  status: DropItemStatus;
  createdAt: string;
  updatedAt: string;
  resurfacedAt?: string;
  closedAt?: string;
};

export type DropStoreModel = {
  items: DropItem[];
  lastCapturedItemId?: string;
  updatedAt: string;
};
