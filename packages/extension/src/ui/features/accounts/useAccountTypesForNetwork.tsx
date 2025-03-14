import { isFeatureEnabled } from "@argent/x-shared"

import {
  WalletSecondaryIcon,
  MultisigSecondaryIcon,
  ShieldSecondaryIcon,
  ImportIcon,
} from "@argent/x-ui/icons"

import { LedgerLogo } from "@argent/x-ui/logos-deprecated"
import { isFunction } from "lodash-es"
import { useMemo } from "react"

import { Link } from "@chakra-ui/react"
import { type Network } from "../../../shared/network"
import { isSmartAccountEnabled } from "../../../shared/smartAccount/useSmartAccountEnabled"
import { AccountTypeId, type AccountType } from "./AddNewAccountScreen"
import { SmartAccountDetailedDescription } from "./SmartAccountDetailsDescription"

const ICON_SIZE = 6

type AccountTypeWithEnabled = AccountType & {
  enabled: ((network: Network) => boolean) | boolean
  onboarding: boolean
}

const SmartAccountSubtitle = () => (
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
)

const getAllAccountTypes = (): AccountTypeWithEnabled[] => [
  {
    id: AccountTypeId.SMART_ACCOUNT,
    type: "smart",
    title: "Smart Account",
    subtitle: <SmartAccountSubtitle />,
    detailedDescription: <SmartAccountDetailedDescription />,
    label: "Recommended",
    icon: <ShieldSecondaryIcon height={ICON_SIZE} width={ICON_SIZE} />,
    enabled: (network: Network) => isSmartAccountEnabled(network.id),
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
    subtitle: "Import existing Argent accounts",
    icon: <ImportIcon height={ICON_SIZE} width={ICON_SIZE} />,
    enabled: true,
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
