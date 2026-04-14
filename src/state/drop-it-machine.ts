export type RitualPhase = 'capture' | 'feedback' | 'held' | 'resurface' | 'closure';

export type RitualEvent =
  | { type: 'CAPTURE_SUBMITTED'; itemId: string }
  | { type: 'FEEDBACK_COMPLETE' }
  | { type: 'RESURFACE_REQUESTED'; itemId: string }
  | { type: 'RESURFACE_DISMISSED'; itemId: string }
  | { type: 'ITEM_CLOSED'; itemId: string }
  | { type: 'START_CAPTURE' }
  | { type: 'RESET_RITUAL' };

export type RitualUiState = {
  phase: RitualPhase;
  activeItemId: string | null;
};

export const ritualTransitionMap: Record<RitualPhase, RitualEvent['type'][]> = {
  capture: ['CAPTURE_SUBMITTED'],
  feedback: ['FEEDBACK_COMPLETE'],
  held: ['RESURFACE_REQUESTED', 'ITEM_CLOSED', 'START_CAPTURE'],
  resurface: ['RESURFACE_DISMISSED', 'ITEM_CLOSED', 'START_CAPTURE'],
  closure: ['RESET_RITUAL'],
};

const initialUiState: RitualUiState = {
  phase: 'capture',
  activeItemId: null,
};

function canTransition(phase: RitualPhase, eventType: RitualEvent['type']) {
  return ritualTransitionMap[phase].includes(eventType);
}

export function createInitialUiState(): RitualUiState {
  return initialUiState;
}

export function ritualReducer(state: RitualUiState, event: RitualEvent): RitualUiState {
  if (!canTransition(state.phase, event.type)) {
    return state;
  }

  switch (event.type) {
    case 'CAPTURE_SUBMITTED':
      return {
        phase: 'feedback',
        activeItemId: event.itemId,
      };
    case 'FEEDBACK_COMPLETE':
      return {
        ...state,
        phase: 'held',
      };
    case 'RESURFACE_REQUESTED':
      return {
        phase: 'resurface',
        activeItemId: event.itemId,
      };
    case 'RESURFACE_DISMISSED':
      return {
        phase: 'held',
        activeItemId: event.itemId,
      };
    case 'ITEM_CLOSED':
      return {
        phase: 'closure',
        activeItemId: event.itemId,
      };
    case 'START_CAPTURE':
      return {
        phase: 'capture',
        activeItemId: null,
      };
    case 'RESET_RITUAL':
      return {
        phase: 'capture',
        activeItemId: null,
      };
    default:
      return state;
  }
}
