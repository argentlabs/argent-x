import { icons, useNavigateBack } from "@argent/ui"
import { FC, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"

import { accountService } from "../../../shared/account/service"
import { booleanifyEnv } from "../../../shared/utils/booleanifyEnv"
import { CreateAccountType } from "../../../shared/wallet.model"
import { useAction } from "../../hooks/useAction"
import { routes } from "../../routes"
import { assertNever } from "../../services/assertNever"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import { AddNewAccountScreen } from "./AddNewAccountScreen"

const { WalletIcon, MultisigIcon } = icons

export enum AccountTypeId {
  STANDARD,
  MULTISIG,
  // LEDGER,
}

export interface AccountType {
  id: AccountTypeId
  type: CreateAccountType
  title: string
  subtitle?: string
  icon?: React.ReactNode
  enabled?: boolean
}

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
    enabled: booleanifyEnv(process.env.FEATURE_MULTISIG, false),
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
    accountService.create,
  )
  // TODO: should be view after networks was refactored
  const { accountClassHash, id: networkId } = useCurrentNetwork()

  const onAccountTypeClick = useCallback(
    async (accountTypeId: AccountTypeId) => {
      switch (accountTypeId) {
        case AccountTypeId.STANDARD:
          await addAccount("standard", networkId) // default
          return navigate(routes.accounts())

        case AccountTypeId.MULTISIG:
          return navigate(routes.multisigNew())

        // case AccountTypeId.LEDGER:
        // navigate(routes.ledgerEntry())
        // break

        default:
          assertNever(accountTypeId) // Should always be handled
      }
    },
    [addAccount, navigate, networkId],
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
    (type: CreateAccountType) =>
      Boolean(type === "standard" || accountClassHash?.[type]), // always enabled for standard
    [accountClassHash],
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
