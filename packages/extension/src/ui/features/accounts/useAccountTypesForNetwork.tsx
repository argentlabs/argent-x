import { isFeatureEnabled } from "@argent/x-shared"
import { icons, logosDeprecated } from "@argent/x-ui"
import { isFunction } from "lodash-es"
import { useMemo } from "react"

import { ARGENT_API_ENABLED } from "../../../shared/api/constants"
import { type Network } from "../../../shared/network"
import { getDefaultNetworkId } from "../../../shared/network/utils"
import { AccountTypeId, type AccountType } from "./AddNewAccountScreen"
import { SmartAccountDetailedDescription } from "./SmartAccountDetailsDescription"
import { Link } from "@chakra-ui/react"

const {
  WalletSecondaryIcon,
  MultisigSecondaryIcon,
  ShieldSecondaryIcon,
  ImportIcon,
} = icons

const { LedgerLogo } = logosDeprecated

const ICON_SIZE = 6

type AccountTypeWithEnabled = AccountType & {
  enabled: ((network: Network) => boolean) | boolean
  onboarding: boolean
}

const getAllAccountTypes = (): AccountTypeWithEnabled[] => [
  {
    id: AccountTypeId.SMART_ACCOUNT,
    type: "smart",
    title: "Smart Account",
    subtitle: (
      <>
        Designed for those who value security and easy of use.{" "}
        <Link
          href="https://www.argent.xyz/blog/smart-wallet-features"
          target="_blank"
          color="text-brand"
        >
          Learn more
        </Link>
      </>
    ),
    detailedDescription: <SmartAccountDetailedDescription />,
    label: "Recommended",
    icon: <ShieldSecondaryIcon height={ICON_SIZE} width={ICON_SIZE} />,
    enabled: (network: Network) =>
      ARGENT_API_ENABLED && getDefaultNetworkId() === network.id,
    onboarding: true,
  },
  {
    id: AccountTypeId.STANDARD,
    type: "standard",
    title: "Standard Account",
    subtitle: "Designed for basic usage",
    icon: <WalletSecondaryIcon height={ICON_SIZE} width={ICON_SIZE} />,
    enabled: true, // always enabled
    onboarding: true,
  },
  {
    id: AccountTypeId.STANDARD_CAIRO_0,
    type: "standardCairo0",
    title: "Standard Cairo 0 Account",
    subtitle: "Create a new Cairo 0 Argent X account",
    icon: <WalletSecondaryIcon height={ICON_SIZE} width={ICON_SIZE} />,
    enabled: isFeatureEnabled(process.env.NEW_CAIRO_0_ENABLED),
    onboarding: false,
  },
  {
    id: AccountTypeId.LEDGER,
    type: "standard",
    title: "Ledger Account",
    subtitle: "Use a Ledger hardware wallet",
    icon: <LedgerLogo height={ICON_SIZE} width={ICON_SIZE} />,
    enabled: true,
    onboarding: false,
    disabledText: "Not supported on Firefox",
  },
  {
    id: AccountTypeId.IMPORTED,
    type: "imported",
    title: "Import from private key",
    icon: <ImportIcon height={ICON_SIZE} width={ICON_SIZE} />,
    enabled: (network: Network) =>
      network.id === "sepolia-alpha" || network.id === "localhost",
    onboarding: false,
  },
  {
    id: AccountTypeId.MULTISIG,
    type: "multisig",
    title: "Multisig Account",
    subtitle: "For multiple owners",
    icon: <MultisigSecondaryIcon height={ICON_SIZE} width={ICON_SIZE} />,
    enabled: (network: Network) => Boolean(network.accountClassHash?.multisig),
    onboarding: false,
  },
]

export const getAccountTypesForNetwork = (network: Network): AccountType[] => {
  return getAllAccountTypes().filter((accountType) => {
    if (isFunction(accountType.enabled)) {
      return accountType.enabled(network)
    }
    return accountType.enabled
  })
}

export const getAccountTypesForOnboarding = (
  network: Network,
): AccountType[] => {
  return getAllAccountTypes().filter((accountType) => {
    if (isFunction(accountType.enabled)) {
      return accountType.enabled(network) && accountType.onboarding
    }
    return accountType.enabled && accountType.onboarding
  })
}

export const useAccountTypesForNetwork = (network: Network): AccountType[] => {
  return useMemo(() => getAccountTypesForNetwork(network), [network])
}

export const useAccountTypesForOnboarding = (
  network: Network,
): AccountType[] => {
  return useMemo(() => getAccountTypesForOnboarding(network), [network])
}
