import { useToast } from "@argent/x-ui"
import type { FC } from "react"
import { useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { useAction } from "../../hooks/useAction"
import { useReturnTo } from "../../hooks/useRoute"
import { routes } from "../../../shared/ui/routes"
import { assertNever } from "../../../shared/utils/assertNever"
import {
  type AccountType,
  AccountTypeId,
  AddNewAccountScreen,
} from "./AddNewAccountScreen"
import { clientAccountService } from "../../services/account"
import { useAccountTypesForNetwork } from "./useAccountTypesForNetwork"
import { useSmartAccountVerifiedEmail } from "../smartAccount/useSmartAccountVerifiedEmail"
import { clientArgentAccountService } from "../../services/argentAccount"
import { resetDevice } from "../../../shared/smartAccount/jwt"
import { SignerType } from "../../../shared/wallet.model"
import { useOnLedgerStart } from "../ledger/hooks/useOnLedgerStart"
import { useIsFirefox } from "../../hooks/useUserAgent"
import { useNavigateReturnToOrBack } from "../../hooks/useNavigateReturnTo"
import { useNetwork } from "../networks/hooks/useNetwork"

export const AddNewAccountScreenContainer: FC = () => {
  const { networkId } = useParams()
  const navigate = useNavigate()
  const { action: addAccount, loading: isAdding } = useAction(
    clientAccountService.create.bind(clientAccountService),
  )
  const verifiedEmail = useSmartAccountVerifiedEmail()
  // TODO: should be view after networks was refactored

  const returnTo = useReturnTo()
  const network = useNetwork(networkId ?? "")
  const accountTypes = useAccountTypesForNetwork(network)
  const onLedgerStart = useOnLedgerStart("standard")
  const toast = useToast()
  const isFirefox = useIsFirefox()

  const handleSmartAccountCreate = useCallback(async () => {
    if (verifiedEmail) {
      try {
        const isExpired = await clientArgentAccountService.isTokenExpired({
          initiator: "AddNewAccountScreenContainer/handleSmartAccountCreate",
        })

        if (isExpired) {
          await resetDevice()
          await clientArgentAccountService.requestEmail(verifiedEmail)
          navigate(
            routes.createSmartAccountOTP(verifiedEmail, "createSmartAccount"),
          )
        } else {
          await addAccount("smart", SignerType.LOCAL_SECRET, network.id)
          return navigate(routes.accounts(), {
            replace: true,
          })
        }
      } catch {
        toast({
          title: "Unable to verify email",
          status: "error",
          duration: 3000,
        })
      }
    } else {
      navigate(routes.createSmartAccountEmail("createSmartAccount"))
    }
  }, [addAccount, navigate, network.id, toast, verifiedEmail])

  const onAccountTypeConfirmed = useCallback(
    async (accountTypeId: AccountTypeId) => {
      switch (accountTypeId) {
        case AccountTypeId.STANDARD:
          await addAccount("standard", SignerType.LOCAL_SECRET, network.id)
          return navigate(routes.accounts(returnTo))
        case AccountTypeId.STANDARD_CAIRO_0:
          await addAccount(
            "standardCairo0",
            SignerType.LOCAL_SECRET,
            network.id,
          ) // default
          return navigate(routes.accounts(returnTo))
        case AccountTypeId.SMART_ACCOUNT:
          await handleSmartAccountCreate()
          return
        case AccountTypeId.MULTISIG:
          return navigate(routes.multisigNew())

        case AccountTypeId.LEDGER:
          return onLedgerStart("import", network.id)

        case AccountTypeId.IMPORTED:
          return navigate(routes.privateKeyImport(returnTo))

        default:
          assertNever(accountTypeId) // Should always be handled
      }
    },
    [
      addAccount,
      handleSmartAccountCreate,
      navigate,
      network.id,
      onLedgerStart,
      returnTo,
    ],
  )

  const isAccountTypeLoading = useCallback(
    (id: AccountType["id"]) => {
      if (id === AccountTypeId.STANDARD && isAdding) {
        return true
      }
      if (id === AccountTypeId.SMART_ACCOUNT && isAdding) {
        return true
      }
      // More cases here

      return false
    },
    [isAdding],
  )

  const isAccountTypeDisabled = useCallback(
    (id: AccountType["id"]) => {
      if (id === AccountTypeId.LEDGER) {
        return isFirefox
      }
      return false
    },
    [isFirefox],
  )

  const onBack = useNavigateReturnToOrBack()

  return (
    <AddNewAccountScreen
      onClose={onBack}
      accountTypes={accountTypes}
      isAccountTypeLoading={isAccountTypeLoading}
      isAccountTypeDisabled={isAccountTypeDisabled}
      onAccountTypeConfirmed={(accountTypeId) =>
        void onAccountTypeConfirmed(accountTypeId)
      }
    />
  )
}
