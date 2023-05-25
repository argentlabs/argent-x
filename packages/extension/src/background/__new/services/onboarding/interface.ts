export interface IOnboardingService {
  /** whether user has an onboarded wallet */
  getOnboardingComplete(): Promise<boolean>

  /** opens the onboarding flow */
  openOnboarding(): Promise<void>

  /** whether clicking extension icon opens onboarding */
  iconClickOpensOnboarding(): void

  /** whether clicking extension icon opens popup */
  iconClickOpensPopup(): void
}
