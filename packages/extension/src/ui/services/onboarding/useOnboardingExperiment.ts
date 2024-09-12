import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"

// all the different variants for the onboarding experiment
export type OnboardingCohort = "E1A1" | "E1A2" | "E1B" | "E2A1" | "E2A2" | "E2B"

const cohorts: OnboardingCohort[] = [
  "E1A1",
  "E1A2",
  "E1B",
  "E2A1",
  "E2A2",
  "E2B",
]

const cohortsThatShowNewLabel: OnboardingCohort[] = [
  "E1B",
  "E2A1",
  "E2A2",
  "E2B",
]

const cohortsThatShowSmartAccountButtonVariant: OnboardingCohort[] = [
  "E2A1",
  "E2A2",
  "E2B",
]

const cohortsThatShowExperimentalFinishScreen: OnboardingCohort[] = ["E2B"]

const cohortsThatShowAccountSubtitle: OnboardingCohort[] = ["E2B"]

const cohortsThatShowNewAccountDescriptions: OnboardingCohort[] = ["E2B"]
const cohortsThatShowNewEmailWording = ["E2B"]
const assignRandomCohort = (): OnboardingCohort => {
  const randomIndex = Math.floor(Math.random() * cohorts.length)
  return cohorts[randomIndex]
}

const getInitialCohort = (): OnboardingCohort => {
  const storedCohort = localStorage.getItem(
    "onboardingExperiment",
  ) as OnboardingCohort | null
  if (storedCohort) {
    return storedCohort
  }
  const newCohort = assignRandomCohort()
  localStorage.setItem("onboardingExperiment", newCohort)
  return newCohort
}

const onboardingExperimentAtom = atomWithStorage<OnboardingCohort>(
  "onboardingExperiment",
  getInitialCohort(),
)

export const useOnboardingExperiment = () => {
  const [onboardingExperimentCohort] = useAtom(onboardingExperimentAtom)
  return {
    onboardingExperimentCohort,
  }
}

export const useShowNewLabel = () => {
  const { onboardingExperimentCohort } = useOnboardingExperiment()

  const showNewLabel = cohortsThatShowNewLabel.includes(
    onboardingExperimentCohort,
  )
  return {
    showNewLabel,
  }
}

export const useShowExperimentalFinishScreen = () => {
  const { onboardingExperimentCohort } = useOnboardingExperiment()

  const showExperimentalFinishScreen =
    cohortsThatShowExperimentalFinishScreen.includes(onboardingExperimentCohort)
  return {
    showExperimentalFinishScreen,
  }
}

export const useShowAccountSubtitle = () => {
  const { onboardingExperimentCohort } = useOnboardingExperiment()

  const showAccountSubtitle = cohortsThatShowAccountSubtitle.includes(
    onboardingExperimentCohort,
  )
  return {
    showAccountSubtitle,
  }
}

export const useShowSmartAccountButtonVariant = () => {
  const { onboardingExperimentCohort } = useOnboardingExperiment()

  const showSmartAccountButtonVariant =
    cohortsThatShowSmartAccountButtonVariant.includes(
      onboardingExperimentCohort,
    )
  return {
    showSmartAccountButtonVariant,
  }
}

export const useShowNewAccountDescriptions = () => {
  const { onboardingExperimentCohort } = useOnboardingExperiment()

  const showNewAccountDescriptions =
    cohortsThatShowNewAccountDescriptions.includes(onboardingExperimentCohort)
  return {
    showNewAccountDescriptions,
  }
}

export const useShowNewEmailWording = () => {
  const { onboardingExperimentCohort } = useOnboardingExperiment()

  const showNewEmailWording = cohortsThatShowNewEmailWording.includes(
    onboardingExperimentCohort,
  )
  return {
    showNewEmailWording,
  }
}
