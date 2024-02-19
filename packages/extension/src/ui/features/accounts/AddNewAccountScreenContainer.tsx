import { useNavigateBack } from "@argent/ui"
import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { useAction } from "../../hooks/useAction"
import { routes, useReturnTo } from "../../routes"
import { assertNever } from "../../../shared/utils/assertNever"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import {
  type AccountType,
  AccountTypeId,
  AddNewAccountScreen,
} from "./AddNewAccountScreen"
import { clientAccountService } from "../../services/account"
import { useAccountTypesForNetwork } from "./useAccountTypesForNetwork"

export const AddNewAccountScreenContainer: FC = () => {
  const navigate = useNavigate()
  const { action: addAccount, loading: isAdding } = useAction(
    clientAccountService.create.bind(clientAccountService),
  )
  // TODO: should be view after networks was refactored
  const network = useCurrentNetwork()
  const returnTo = useReturnTo()
  const accountTypes = useAccountTypesForNetwork(network)

  const onAccountTypeClick = useCallback(
    async (accountTypeId: AccountTypeId) => {
      switch (accountTypeId) {
        case AccountTypeId.STANDARD:
          await addAccount("standard", network.id) // default
          return navigate(routes.accounts(returnTo))
        case AccountTypeId.STANDARD_CAIRO_0:
          await addAccount("standardCairo0", network.id) // default
          return navigate(routes.accounts(returnTo))

        case AccountTypeId.MULTISIG:
          return navigate(routes.multisigNew())

        // case AccountTypeId.LEDGER:
        // navigate(routes.ledgerEntry())
        // break

        default:
          assertNever(accountTypeId) // Should always be handled
      }
    },
    [addAccount, navigate, network.id, returnTo],
  )

  const isAccountTypeLoading = useCallback(
    (id: AccountType["id"]) => {
      if (id === AccountTypeId.STANDARD && isAdding) {
        return true
      }

      // More cases here

      return false
    },
    [isAdding],
  )

  const onClose = useNavigateBack()

  return (
    <AddNewAccountScreen
      onClose={onClose}
      accountTypes={accountTypes}
      isAccountTypeLoading={isAccountTypeLoading}
      onAccountTypeClick={onAccountTypeClick}
    />
  )
}
