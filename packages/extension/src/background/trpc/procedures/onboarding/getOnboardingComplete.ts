import { extensionOnlyProcedure } from "../permissions"

export const getOnboardingCompleteProcedure = extensionOnlyProcedure.query(
  async ({
    ctx: {
      services: { onboardingService },
    },
  }) => {
    return await onboardingService.getOnboardingComplete()
  },
)
