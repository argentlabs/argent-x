import { router } from "../../trpc"
import { getOnboardingCompleteProcedure } from "./getOnboardingComplete"

export const onboardingRouter = router({
  getOnboardingComplete: getOnboardingCompleteProcedure,
})
