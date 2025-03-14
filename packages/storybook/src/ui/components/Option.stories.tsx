import { Option } from "@argent-x/extension/src/ui/components/Option"
import { TrackingLink } from "@argent-x/extension/src/ui/components/TrackingLink"
import { formatTruncatedAddress } from "@argent/x-shared"
import { storybookCellStackDecorator } from "@argent/x-ui"

const L1_BRIDGE_CONTRACT_ADDRESS = "0xaea4513378eb6023cf9ce730a26255d0e3f075b9"

import {
  CardSecondaryIcon,
  ChevronRightSecondaryIcon,
  DocumentIcon,
} from "@argent/x-ui/icons"

export default {
  component: Option,
  decorators: [storybookCellStackDecorator],
}

export const BuyWithCard = {
  args: {
    as: TrackingLink,
    targetBlank: true,
    href: "https://www.orbiter.finance/?referer=argent&dest=starknet&fixed=1&source=Mainnet",
    title: "Buy with card or bank transfer",
    icon: <CardSecondaryIcon />,
    hideArrow: true,
  },
}

export const FromAnExchange = {
  args: {
    title: "From an exchange",
    description: "Coinbase, Binance, etc",
    icon: <CardSecondaryIcon />,
  },
}

export const BridgeFromEthereum = {
  args: {
    title: "Bridge from Ethereum and other chains",
    icon: <CardSecondaryIcon />,
  },
}

export const Disabled = {
  args: {
    title: "High security",
    description: "Coming soon",
    icon: <CardSecondaryIcon />,
    isDisabled: true,
  },
}

export const Warn = {
  args: {
    title: "Low security",
    description: "Save a recovery phrase",
    icon: <CardSecondaryIcon />,
    colorScheme: "warning",
  },
}

export const Danger = {
  args: {
    title: "Low security",
    description: "Save a recovery phrase",
    icon: <CardSecondaryIcon />,
    colorScheme: "danger",
  },
}

export const Stake = {
  args: {
    title: "Stake STRK and start earning",
    description: "Earn 6.91% APY",
    icon: <CardSecondaryIcon />,
    rightIcon: <ChevronRightSecondaryIcon />,
  },
}

export const LinkWithCopy = {
  args: {
    as: TrackingLink,
    targetBlank: true,
    href: `https://www.orbiter.finance/?referer=argent&dest=starknet&fixed=1&source=Mainnet`,
    title: "L1 ETH bridge",
    description: formatTruncatedAddress(L1_BRIDGE_CONTRACT_ADDRESS),
    icon: <DocumentIcon />,
    copyValue: L1_BRIDGE_CONTRACT_ADDRESS,
  },
}
