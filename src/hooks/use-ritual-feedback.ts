import { useMemo } from 'react';

import { getRitualFeedbackService } from '@/src/services/ritual-feedback';

export function useRitualFeedback() {
  const service = useMemo(() => getRitualFeedbackService(), []);

  return {
    onDropSuccess: () => {
      void Promise.all([service.playSound('drop'), service.hapticDropSuccess()]);
    },
    onFeedbackConfirmation: () => {
      void Promise.all([service.playSound('confirmation'), service.hapticConfirmation()]);
    },
    onClosureSound: () => {
      void service.playSound('closure');
    },
    onClosureComplete: () => {
      void service.hapticClosureComplete();
    },
  };
}
