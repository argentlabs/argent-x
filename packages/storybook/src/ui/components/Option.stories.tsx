import { Option } from "@argent-x/extension/src/ui/components/Options"
import CardSvg from "@argent-x/extension/src/ui/features/funding/card.svg"

export default {
  component: Option,
}

export const BuyWithCard = {
  args: {
    title: "Buy with card or bank transfer",
    icon: <CardSvg />,
    hideArrow: true,
  },
}

export const FromAnExchange = {
  args: {
    title: "From an exchange",
    description: "Coinbase, Binance, etc",
    icon: <CardSvg />,
  },
}

export const BridgeFromEthereum = {
  args: {
    title: "Bridge from Ethereum and other chains",
    icon: <CardSvg />,
  },
}

export const Disabled = {
  args: {
    title: "High security",
    description: "Coming soon",
    icon: <CardSvg />,
    disabled: true,
  },
}

export const Warn = {
  args: {
    title: "Low security",
    description: "Save a recovery phrase",
    icon: <CardSvg />,
    variant: "warn",
  },
}

export const Danger = {
  args: {
    title: "Low security",
    description: "Save a recovery phrase",
    icon: <CardSvg />,
    variant: "danger",
  },
}
