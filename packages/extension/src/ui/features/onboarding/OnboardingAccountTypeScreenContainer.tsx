import type { FC } from "react"
import { useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { defaultNetwork } from "../../../shared/network"
import { useAction } from "../../hooks/useAction"
import { routes } from "../../../shared/ui/routes"
import { clientAccountService } from "../../services/account"
import { AccountTypeId } from "../accounts/AddNewAccountScreen"
import { useAccountTypesForOnboarding } from "../accounts/useAccountTypesForNetwork"
import { OnboardingAccountTypeScreen } from "./OnboardingAccountTypeScreen"
import { ampli } from "../../../shared/analytics"
import { SignerType } from "../../../shared/wallet.model"

export const OnboardingAccountTypeContainer: FC = () => {
  const navigate = useNavigate()

  const { action: addAccount, loading: isAdding } = useAction(
    clientAccountService.create.bind(clientAccountService),
  )

  const onBack = useCallback(() => {
    navigate(routes.onboardingPassword.path)
  }, [navigate])

  // NOTE: no need to pull this from any state, as the extension was not setup yet, so defaultNetwork is fine
  // we should still get rid of useAppState and any generic global state
  const network = defaultNetwork

  const accountTypes = useAccountTypesForOnboarding(network)

  const handleContinue = useCallback(
    async (accountTypeId: AccountTypeId) => {
      if (accountTypeId === AccountTypeId.STANDARD) {
        const newAccount = await addAccount(
          "standard",
          SignerType.LOCAL_SECRET, // change to dynamic when needed
          network.id,
        )

        await clientAccountService.select(newAccount.id)
        ampli.onboardingAccountTypeSelected({
          "account type": "standard",
          "wallet platform": "browser extension",
        })

        ampli.onboardingCompleted({
          "account type": "standard",
          "wallet platform": "browser extension",
        })
        return navigate(routes.onboardingFinish.path, { replace: true })
      } else if (accountTypeId === AccountTypeId.SMART_ACCOUNT) {
        ampli.onboardingAccountTypeSelected({
          "account type": "smart",
          "wallet platform": "browser extension",
        })
        navigate(routes.onboardingSmartAccountEmail())
      }
    },
    [addAccount, navigate, network.id],
  )

  const isAccountTypeLoading = useCallback(
    (id: AccountTypeId) => {
      if (
        isAdding &&
        (id === AccountTypeId.STANDARD || id === AccountTypeId.SMART_ACCOUNT)
      ) {
        return true
      }
      // More cases here

      return false
    },
    [isAdding],
  )

  return (
    <OnboardingAccountTypeScreen
      onBack={onBack}
      accountTypes={accountTypes}
      onAccountTypeConfirmed={(accountTypeId) =>
        void handleContinue(accountTypeId)
      }
      isAccountTypeLoading={isAccountTypeLoading}
    />
  )
}
