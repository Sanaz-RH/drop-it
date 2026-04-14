# Testing Notes

## Core user flow
1. User lands in **Capture** and enters one thought.
2. User submits (send button or tilt gesture in dev mode).
3. User sees **Received** confirmation and emotional release copy.
4. Thought moves into **Held** state.
5. User long-presses a held item to either resurface it now or close it.
6. Resurfaced items appear in **Resurfacing** sheet with `later` vs `done` actions.
7. `done` drives the **Closure** ritual and removes the item from storage.

## Experimental interactions
- **Tilt-to-drop** gesture trigger (guarded by experiment flag + dev toggle).
- **Dev helpers in Capture**: `Fill draft` and `Resurface now` for moderated session setup.
- Timing/animation tuning across transitions (ring pulse, received sequence, resurfacing sheet, closure strips).

## What to observe in testing
- Whether people understand the loop without explanatory UI.
- If wording feels supportive/ritualized vs task-management.
- If transition timing feels smooth (no jank, no dead time, no abrupt cuts).
- Whether quiet/empty moments feel intentional rather than broken.
- Whether users discover long-press affordance for held items.

## Mocked vs real
- **Real**: local persistence (`expo-file-system`) for item lifecycle and state restoration.
- **Real**: ritual phase transitions and action handlers.
- **Mocked/placeholder**: haptics/audio feedback are best-effort wrappers and may no-op on unsupported targets.
- **Seeded demo data**: initial held items are preloaded on first run for testing convenience.
