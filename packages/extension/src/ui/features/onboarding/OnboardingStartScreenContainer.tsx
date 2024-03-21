import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../routes"
import { OnboardingStartScreen } from "./OnboardingStartScreen"
import { analyticsService } from "../../../shared/analytics"

export const OnboardingStartScreenContainer: FC = () => {
  const navigate = useNavigate()

  const onCreate = useCallback(() => {
    analyticsService.onboardingStarted()
    void navigate(routes.onboardingPrivacy("password"))
  }, [navigate])

  const onRestore = useCallback(() => {
    void navigate(routes.onboardingPrivacy("seedphrase"))
  }, [navigate])

  return <OnboardingStartScreen onCreate={onCreate} onRestore={onRestore} />
}
