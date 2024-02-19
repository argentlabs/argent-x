import { isFeatureEnabled } from "@argent/shared"
import { isFunction } from "lodash-es"
import { useMemo } from "react"
import { icons } from "@argent/ui"

import { type Network } from "../../../shared/network"
import { AccountTypeId, type AccountType } from "./AddNewAccountScreen"

const { WalletIcon, MultisigIcon } = icons

type AccountTypeWithEnabled = AccountType & {
  enabled: ((network: Network) => boolean) | boolean
}

const allAccountTypes: AccountTypeWithEnabled[] = [
  {
    id: AccountTypeId.STANDARD,
    type: "standard",
    title: "Standard Account",
    subtitle: "Create a new Argent X account",
    icon: <WalletIcon />,
    enabled: true, // always enabled
  },
  {
    id: AccountTypeId.STANDARD_CAIRO_0,
    type: "standardCairo0",
    title: "Standard Cairo 0 Account",
    subtitle: "Create a new Cairo 0 Argent X account",
    icon: <WalletIcon />,
    enabled: isFeatureEnabled(process.env.NEW_CAIRO_0_ENABLED),
  },
  {
    id: AccountTypeId.MULTISIG,
    type: "multisig",
    title: "Multisig Account",
    subtitle: "For multiple owners",
    icon: <MultisigIcon />,
    enabled: (network: Network) => Boolean(network.accountClassHash?.multisig),
  },
  //   {
  //     title: "Connect Ledger",
  //     subtitle: "Use a Ledger hardware wallet",
  //     icon: <Ledger />,
  //     enabled: booleanifyEnv("FEATURE_LEDGER", false),
  //   },
]

export const useAccountTypesForNetwork = (network: Network): AccountType[] => {
  return useMemo(() => {
    const accountTypesForNetwork = allAccountTypes.filter((accountType) => {
      if (isFunction(accountType.enabled)) {
        return accountType.enabled(network)
      }
      return accountType.enabled
    })
    return accountTypesForNetwork
  }, [network])
}
