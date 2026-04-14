# Sound integration placeholder

The app intentionally ships with **no audio assets**.

`src/services/ritual-feedback.ts` currently stubs these sound cues with a dev log:

- `drop`
- `confirmation`
- `closure`

To add real sounds later:

1. Add your audio runtime implementation in `src/services/ritual-feedback.ts`.
2. Load/play the three cues in `playSound`.
3. Keep the cue names unchanged so existing trigger points continue to work.
