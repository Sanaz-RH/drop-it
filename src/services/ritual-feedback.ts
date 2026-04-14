import * as Haptics from 'expo-haptics';

type RitualCue = 'drop' | 'confirmation' | 'closure';

class RitualFeedbackService {
  private logStub(cue: RitualCue) {
    if (__DEV__) {
      console.log(`[drop-it sound stub] ${cue}`);
    }
  }

  async playSound(cue: RitualCue) {
    this.logStub(cue);
  }

  async hapticDropSuccess() {
    await Haptics.selectionAsync();
  }

  async hapticConfirmation() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  async hapticClosureComplete() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
}

const ritualFeedbackService = new RitualFeedbackService();

export function getRitualFeedbackService() {
  return ritualFeedbackService;
}
