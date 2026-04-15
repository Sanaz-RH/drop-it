import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';

import { useRitualFeedback } from '@/src/hooks/use-ritual-feedback';
import { createInitialUiState, ritualReducer, ritualTransitionMap, RitualPhase } from '@/src/state/drop-it-machine';
import { loadDropStore, saveDropStore } from '@/src/storage/drop-storage';
import { DropItem, DropStoreModel } from '@/src/types/drop-item';

const FEEDBACK_DELAY_MS = 5200;

type ResurfaceReason = 'manual' | 'demo';

export function useDropItController() {
  const [ui, dispatch] = useReducer(ritualReducer, undefined, createInitialUiState);
  const ritualFeedback = useRitualFeedback();
  const [store, setStore] = useState<DropStoreModel | null>(null);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    async function bootstrap() {
      const loaded = await loadDropStore();
      setStore(loaded);
    }

    bootstrap();
  }, []);

  useEffect(() => {
    if (ui.phase !== 'feedback') {
      return;
    }

    const timeout = setTimeout(() => {
      dispatch({ type: 'FEEDBACK_COMPLETE' });
    }, FEEDBACK_DELAY_MS);

    return () => clearTimeout(timeout);
  }, [ui.phase]);

  const persistStore = useCallback(async (next: DropStoreModel) => {
    setStore(next);
    await saveDropStore(next);
  }, []);

  const prepareCaptureItem = useCallback(async () => {
    const text = draft.trim();

    if (!text || !store) {
      return null;
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
    setDraft('');
    return item;
  }, [draft, persistStore, store]);

  const commitCaptureTransition = useCallback((itemId: string) => {
    dispatch({ type: 'CAPTURE_SUBMITTED', itemId });
  }, []);

  const requestResurface = useCallback(
    async (itemId: string, reason: ResurfaceReason = 'manual') => {
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
                status: 'resurfaced',
                resurfacedAt: now,
                updatedAt: now,
              }
            : item
        ),
        updatedAt: now,
      };

      await persistStore(nextStore);
      dispatch({ type: 'RESURFACE_REQUESTED', itemId });

      if (__DEV__ && reason === 'demo') {
        console.log(`[drop-it demo] Resurfaced held item ${itemId}`);
      }
    },
    [persistStore, store]
  );

  const dismissResurfacedItem = useCallback(
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
                status: 'held',
                updatedAt: now,
              }
            : item
        ),
        updatedAt: now,
      };

      await persistStore(nextStore);
      dispatch({ type: 'RESURFACE_DISMISSED', itemId });
    },
    [persistStore, store]
  );

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
      dispatch({ type: 'ITEM_CLOSED', itemId });
    },
    [persistStore, store]
  );

  const completeClosure = useCallback(
    async (itemId: string) => {
      if (!store) {
        dispatch({ type: 'RESET_RITUAL' });
        return;
      }

      const now = new Date().toISOString();
      const nextStore: DropStoreModel = {
        ...store,
        items: store.items.filter((item) => item.id !== itemId),
        updatedAt: now,
      };

      await persistStore(nextStore);
      dispatch({ type: 'RESET_RITUAL' });
    },
    [persistStore, store]
  );

  const goToCapture = useCallback(() => {
    dispatch({ type: ui.phase === 'closure' ? 'RESET_RITUAL' : 'START_CAPTURE' });
  }, [ui.phase]);

  const items = useMemo(() => store?.items ?? [], [store]);

  const activeItem = useMemo(
    () => items.find((item) => item.id === ui.activeItemId) ?? null,
    [items, ui.activeItemId]
  );

  const latestHeldItem = useMemo(() => items.find((item) => item.status === 'held') ?? null, [items]);

  const resurfaceNow = useCallback(async () => {
    if (!latestHeldItem) {
      return false;
    }

    await requestResurface(latestHeldItem.id, 'demo');
    return true;
  }, [latestHeldItem, requestResurface]);

  return {
    state: ui.phase as RitualPhase,
    isReady: !!store,
    draft,
    setDraft,
    prepareCaptureItem,
    commitCaptureTransition,
    items,
    activeItem,
    transitionToResurfacing: requestResurface,
    dismissResurfacedItem,
    closeItem,
    completeClosure,
    goToCapture,
    resurfaceNow,
    canResurfaceNow: !!latestHeldItem,
    transitionModel: ritualTransitionMap,
    onDropSuccess: ritualFeedback.onDropSuccess,
    onFeedbackConfirmation: ritualFeedback.onFeedbackConfirmation,
    onClosureSound: ritualFeedback.onClosureSound,
    onClosureComplete: ritualFeedback.onClosureComplete,
  };
}
