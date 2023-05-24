import { onboardingWorker } from "./__new/services/onboarding"

/** TODO: refactor: remove this facade */
export function initOnboarding() {
  return {
    onboardingWorker,
  }
}
