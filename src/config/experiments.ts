/**
 * Global experiment flags for real-world interaction tests.
 * Keep temporary experiments isolated here for easy removal.
 */
export const experiments = {
  tiltToDrop: {
    /**
     * Master kill-switch for tilt-to-drop experiment.
     * Set to false to fully disable the gesture path.
     */
    enabled: true,
  },
} as const;
