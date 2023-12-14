import { icons, useNavigateBack } from "@argent/ui"
import { FC, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"

import { useAction } from "../../hooks/useAction"
import { routes, useReturnTo } from "../../routes"
import { assertNever } from "../../services/assertNever"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import {
  AccountType,
  AccountTypeId,
  AddNewAccountScreen,
} from "./AddNewAccountScreen"
import { clientAccountService } from "../../services/account"

const { WalletIcon, MultisigIcon } = icons

const accountTypes: AccountType[] = [
  {
    id: AccountTypeId.STANDARD,
    type: "standard",
    title: "Standard Account",
    subtitle: "Create a new Argent X account",
    icon: <WalletIcon />,
    enabled: true, // always enabled
  },
  {
    id: AccountTypeId.MULTISIG,
    type: "multisig",
    title: "Multisig Account",
    subtitle: "For multiple owners",
    icon: <MultisigIcon />,
    enabled: true,
  },

  //   {
  //     title: "Connect Ledger",
  //     subtitle: "Use a Ledger hardware wallet",
  //     icon: <Ledger />,
  //     enabled: booleanifyEnv("FEATURE_LEDGER", false),
  //   },
]

export const AddNewAccountScreenContainer: FC = () => {
  const navigate = useNavigate()
  const { action: addAccount, loading: isAdding } = useAction(
    clientAccountService.create.bind(clientAccountService),
  )
  // TODO: should be view after networks was refactored
  const { id: networkId } = useCurrentNetwork()
  const returnTo = useReturnTo()

  const onAccountTypeClick = useCallback(
    async (accountTypeId: AccountTypeId) => {
      const isDevnet = networkId === "localhost"

      switch (accountTypeId) {
        case AccountTypeId.STANDARD:
          await addAccount(isDevnet ? "standardCairo0" : "standard", networkId) // default
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
    [addAccount, navigate, networkId, returnTo],
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

  const enabledAccountTypes = useMemo(() => {
    return accountTypes.filter(({ enabled }) => enabled)
  }, [])

  const onClose = useNavigateBack()

  return (
    <AddNewAccountScreen
      onClose={onClose}
      accountTypes={enabledAccountTypes}
      isAccountTypeLoading={isAccountTypeLoading}
      onAccountTypeClick={onAccountTypeClick}
    />
  )
}
