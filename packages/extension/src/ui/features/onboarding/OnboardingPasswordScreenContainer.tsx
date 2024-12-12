import type { FC } from "react"
import { useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../../shared/ui/routes"
import { sessionService } from "../../services/session"
import { OnboardingPasswordScreen } from "./OnboardingPasswordScreen"
import { ampli } from "../../../shared/analytics"

export const OnboardingPasswordScreenContainer: FC = () => {
  const navigate = useNavigate()

  const onBack = useCallback(() => {
    navigate(routes.onboardingPrivacy("password"))
  }, [navigate])

  const handleSubmit = useCallback(
    async (password: string) => {
      await sessionService.startSession(password)
      ampli.onboardingPasswordSet({
        "wallet platform": "browser extension",
      })
      return navigate(routes.onboardingAccountType.path, { replace: true })
    },
    [navigate],
  )

  return (
    <OnboardingPasswordScreen
      onBack={onBack}
      title={"Create a password"}
      onSubmit={handleSubmit}
    />
  )
}
