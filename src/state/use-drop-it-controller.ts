import { useCallback, useEffect, useMemo, useState } from 'react';

import { loadDropStore, saveDropStore } from '@/src/storage/drop-storage';
import { DropItem, DropStoreModel } from '@/src/types/drop-item';

export type AppStateName = 'capture' | 'feedback' | 'held' | 'resurfacing' | 'closure';

const FEEDBACK_DELAY_MS = 1300;

export function useDropItController() {
  const [state, setState] = useState<AppStateName>('capture');
  const [store, setStore] = useState<DropStoreModel | null>(null);
  const [draft, setDraft] = useState('');
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  useEffect(() => {
    async function bootstrap() {
      const loaded = await loadDropStore();
      setStore(loaded);
    }

    bootstrap();
  }, []);

  const persistStore = useCallback(async (next: DropStoreModel) => {
    setStore(next);
    await saveDropStore(next);
  }, []);

  const addItem = useCallback(async () => {
    const text = draft.trim();

    if (!text || !store) {
      return;
    }

    const now = new Date().toISOString();
    const item: DropItem = {
      id: `${Date.now()}`,
      text,
      status: 'held',
      createdAt: now,
      updatedAt: now,
    };

    const nextStore: DropStoreModel = {
      ...store,
      items: [item, ...store.items],
      lastCapturedItemId: item.id,
      updatedAt: now,
    };

    await persistStore(nextStore);
    setActiveItemId(item.id);
    setDraft('');
    setState('feedback');

    setTimeout(() => {
      setState('held');
    }, FEEDBACK_DELAY_MS);
  }, [draft, persistStore, store]);

  const transitionToResurfacing = useCallback((itemId: string) => {
    setActiveItemId(itemId);
    setState('resurfacing');
  }, []);

  const closeItem = useCallback(
    async (itemId: string) => {
      if (!store) {
        return;
      }

      const now = new Date().toISOString();
      const nextStore: DropStoreModel = {
        ...store,
        items: store.items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                status: 'closed',
                closedAt: now,
                updatedAt: now,
              }
            : item
        ),
        updatedAt: now,
      };

      await persistStore(nextStore);
      setActiveItemId(itemId);
      setState('closure');
    },
    [persistStore, store]
  );

  const goToCapture = useCallback(() => {
    setState('capture');
    setActiveItemId(null);
  }, []);

  const items = useMemo(() => store?.items ?? [], [store]);

  const activeItem = useMemo(
    () => items.find((item) => item.id === activeItemId) ?? null,
    [activeItemId, items]
  );

  return {
    state,
    setState,
    isReady: !!store,
    draft,
    setDraft,
    addItem,
    items,
    activeItem,
    transitionToResurfacing,
    closeItem,
    goToCapture,
  };
}
