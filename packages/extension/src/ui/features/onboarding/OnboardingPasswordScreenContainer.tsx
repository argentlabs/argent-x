import { useNavigateBack } from "@argent/x-ui"
import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { defaultNetwork } from "../../../shared/network"
import { routes } from "../../routes"
import { clientAccountService } from "../../services/account"
import { OnboardingPasswordScreen } from "./OnboardingPasswordScreen"
import { sessionService } from "../../services/session"

export const OnboardingPasswordScreenContainer: FC = () => {
  const navigate = useNavigate()
  const onBack = useNavigateBack()

  // NOTE: no need to pull this from any state, as the extension was not setup yet, so defaultNetwork is fine
  // we should still get rid of useAppState and any generic global state
  const networkId = defaultNetwork.id

  const handleDeploy = useCallback(
    async (password: string) => {
      await sessionService.startSession(password)

      const newAccount = await clientAccountService.create(
        "standard",
        networkId,
      )

      await clientAccountService.select(newAccount)

      return navigate(routes.onboardingFinish.path, { replace: true })
    },
    [navigate, networkId],
  )

  return (
    <OnboardingPasswordScreen
      onBack={onBack}
      title={"New wallet"}
      onSubmit={handleDeploy}
    />
  )
}
