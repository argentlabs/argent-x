import { useNavigateBack } from "@argent/ui"
import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { accountService } from "../../../shared/account/service"
import { defaultNetwork } from "../../../shared/network"
import { routes } from "../../routes"
import { clientAccountService } from "../../services/account"
import {
  analytics,
  usePageTracking,
  useTimeSpentWithSuccessTracking,
} from "../../services/analytics"
import { extensionService } from "../../services/extension"
import { OnboardingPasswordScreen } from "./OnboardingPasswordScreen"

export const OnboardingPasswordScreenContainer: FC = () => {
  usePageTracking("createWallet")

  const { trackSuccess } = useTimeSpentWithSuccessTracking(
    "onboardingStepFinished",
    { stepId: "newWalletPassword" },
  )

  const navigate = useNavigate()
  const onBack = useNavigateBack()

  // NOTE: no need to pull this from any state, as the extension was not setup yet, so defaultNetwork is fine
  // we should still get rid of useAppState and any generic global state
  const networkId = defaultNetwork.id

  // NOTE: I (@janek26) think we can get rid of the try/catch quite easily (see further comments), which would make this container a lot cleaner
  const handleDeploy = useCallback(
    async (password: string) => {
      try {
        await extensionService.unlock(password)
        const newAccount = await clientAccountService.createAccount(
          networkId,
          "standard",
        )
        await accountService.select(newAccount)

        // TBD: duplication of "createAccount" which comes from BG?
        void analytics.track("createWallet", {
          status: "success",
          networkId: newAccount.networkId,
        })
        // NOTE: this tracking call is legit, as it relies on information that's only accessable to the UI
        // NOTE: we're not interested in the return of this promise, we should indicate that with void
        void trackSuccess()

        // NOTE: return the navigate promise, to make sure the form waits for it to finish
        return navigate(routes.onboardingFinish.path, { replace: true })
      } catch (error: any) {
        // TBD: duplication of "createAccount" which comes from BG?
        void analytics.track("createWallet", {
          status: "failure",
          errorMessage: error.message,
          networkId: networkId,
        })

        // NOTE: by throwing the error in the submit, the form will handle that and show the retry button message to the user
        throw error
      }
    },
    [navigate, networkId, trackSuccess],
  )

  return (
    <OnboardingPasswordScreen
      onBack={onBack}
      title={"New wallet"}
      onSubmit={handleDeploy}
    />
  )
}
