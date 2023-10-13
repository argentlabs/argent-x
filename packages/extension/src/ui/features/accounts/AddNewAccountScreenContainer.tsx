import { icons, useNavigateBack } from "@argent/ui"
import { FC, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"

import { accountService } from "../../../shared/account/service"
import { CreateAccountType } from "../../../shared/wallet.model"
import { useAction } from "../../hooks/useAction"
import { routes, useReturnTo } from "../../routes"
import { assertNever } from "../../services/assertNever"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import {
  AccountType,
  AccountTypeId,
  AddNewAccountScreen,
} from "./AddNewAccountScreen"
import { isFeatureEnabled } from "@argent/shared"
import { useKeyValueStorage } from "../../../shared/storage/hooks"
import { settingsStore } from "../../../shared/settings"

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
    enabled: isFeatureEnabled(process.env.FEATURE_MULTISIG),
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
    accountService.create.bind(accountService),
  )
  // TODO: should be view after networks was refactored
  const { accountClassHash, id: networkId } = useCurrentNetwork()
  const returnTo = useReturnTo()

  const betaFeatureMultisig = useKeyValueStorage(
    settingsStore,
    "betaFeatureMultisig",
  )

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

  const accountTypeCheck = useCallback(
    (type: CreateAccountType) => {
      if (type === "standard") {
        return true // always enabled for standard
      }

      if (type === "multisig") {
        return betaFeatureMultisig // Check if multisig is enabled in beta features settings
      }

      return !!accountClassHash?.[type]
    }, // always enabled for standard
    [accountClassHash, betaFeatureMultisig],
  )

  const enabledAccountTypes = useMemo(() => {
    return accountTypes.filter(
      ({ type, enabled }) => enabled && accountTypeCheck(type),
    )
  }, [accountTypeCheck])

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
