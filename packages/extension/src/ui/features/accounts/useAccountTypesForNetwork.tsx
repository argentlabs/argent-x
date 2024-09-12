import { isFeatureEnabled } from "@argent/x-shared"
import { P4, iconsDeprecated, logosDeprecated } from "@argent/x-ui"
import { isFunction } from "lodash-es"
import { useMemo } from "react"

import { ARGENT_API_ENABLED } from "../../../shared/api/constants"
import { type Network } from "../../../shared/network"
import { getDefaultNetworkId } from "../../../shared/network/utils"
import { AccountTypeId, type AccountType } from "./AddNewAccountScreen"
import { SmartAccountDetailedDescription } from "./SmartAccountDetailedDescription"
import {
  useShowAccountSubtitle,
  useShowNewAccountDescriptions,
  useShowNewLabel,
} from "../../services/onboarding/useOnboardingExperiment"
import { SmartAccountDetailedDescriptionImproved } from "./SmartAccountDetailsDescriptionImproved"

const { WalletIcon, MultisigIcon, SmartAccountActiveIcon } = iconsDeprecated
const { LedgerLogo } = logosDeprecated

const ICON_SIZE = 6

type AccountTypeWithEnabled = AccountType & {
  enabled: ((network: Network) => boolean) | boolean
  onboarding: boolean
}

const getAllAccountTypes = (
  showNewLabel: boolean,
  showSubtitle: boolean,
  showNewDescription: boolean,
): AccountTypeWithEnabled[] => [
  {
    id: AccountTypeId.SMART_ACCOUNT,
    type: "smart",
    title: "Smart Account",
    subtitle: showSubtitle && (
      <P4 fontWeight="bold" color="neutrals.300">
        Designed for those who value security and easy of use.{" "}
        <a
          href="https://www.argent.xyz/blog/smart-wallet-features"
          target="_blank"
          style={{ color: "#F36A3D" }}
        >
          Learn more
        </a>
      </P4>
    ),
    detailedDescription: showNewDescription ? (
      <SmartAccountDetailedDescriptionImproved />
    ) : (
      <SmartAccountDetailedDescription />
    ),
    label:
      showNewLabel || showNewDescription ? "Recommended" : "Email required",
    icon: <SmartAccountActiveIcon height={ICON_SIZE} width={ICON_SIZE} />,
    enabled: (network: Network) =>
      ARGENT_API_ENABLED && getDefaultNetworkId() === network.id,
    onboarding: true,
  },
  {
    id: AccountTypeId.STANDARD,
    type: "standard",
    title: "Standard Account",
    subtitle: showSubtitle && (
      <P4 fontWeight="bold" color="neutrals.300">
        Designed for basic usage
      </P4>
    ),
    icon: <WalletIcon height={ICON_SIZE} width={ICON_SIZE} />,
    enabled: true, // always enabled
    onboarding: true,
  },
  {
    id: AccountTypeId.STANDARD_CAIRO_0,
    type: "standardCairo0",
    title: "Standard Cairo 0 Account",
    subtitle: "Create a new Cairo 0 Argent X account",
    icon: <WalletIcon height={ICON_SIZE} width={ICON_SIZE} />,
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
    id: AccountTypeId.MULTISIG,
    type: "multisig",
    title: "Multisig Account",
    subtitle: "For multiple owners",
    icon: <MultisigIcon height={ICON_SIZE} width={ICON_SIZE} />,
    enabled: (network: Network) => Boolean(network.accountClassHash?.multisig),
    onboarding: false,
  },
]

export const useAccountTypesForNetwork = (
  network: Network,
  showNewDescription = false,
): AccountType[] => {
  const { showNewLabel } = useShowNewLabel()
  return useMemo(() => {
    const accountTypesForNetwork = getAllAccountTypes(
      showNewLabel,
      false,
      showNewDescription,
    ).filter((accountType) => {
      if (isFunction(accountType.enabled)) {
        return accountType.enabled(network)
      }
      return accountType.enabled
    })
    return accountTypesForNetwork
  }, [network, showNewLabel, showNewDescription])
}

export const useAccountTypesForOnboarding = (
  network: Network,
): AccountType[] => {
  const { showNewLabel } = useShowNewLabel()
  const { showAccountSubtitle } = useShowAccountSubtitle()
  const { showNewAccountDescriptions } = useShowNewAccountDescriptions()
  return useMemo(() => {
    const accountTypesForNetwork = getAllAccountTypes(
      showNewLabel,
      showAccountSubtitle,
      showNewAccountDescriptions,
    ).filter((accountType) => {
      if (isFunction(accountType.enabled)) {
        return accountType.enabled(network) && accountType.onboarding
      }
      return accountType.enabled && accountType.onboarding
    })
    return accountTypesForNetwork
  }, [network, showNewLabel, showAccountSubtitle])
}
