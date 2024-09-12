import { Option } from "@argent-x/extension/src/ui/components/Options"
import { iconsDeprecated } from "@argent/x-ui"

const { CardIcon } = iconsDeprecated

export default {
  component: Option,
}

export const BuyWithCard = {
  args: {
    title: "Buy with card or bank transfer",
    icon: <CardIcon width={6} height={6} />,
    hideArrow: true,
  },
}

export const FromAnExchange = {
  args: {
    title: "From an exchange",
    description: "Coinbase, Binance, etc",
    icon: <CardIcon width={6} height={6} />,
  },
}

export const BridgeFromEthereum = {
  args: {
    title: "Bridge from Ethereum and other chains",
    icon: <CardIcon width={6} height={6} />,
  },
}

export const Disabled = {
  args: {
    title: "High security",
    description: "Coming soon",
    icon: <CardIcon width={6} height={6} />,
    disabled: true,
  },
}

export const Warn = {
  args: {
    title: "Low security",
    description: "Save a recovery phrase",
    icon: <CardIcon width={6} height={6} />,
    variant: "warn",
  },
}

export const Danger = {
  args: {
    title: "Low security",
    description: "Save a recovery phrase",
    icon: <CardIcon width={6} height={6} />,
    variant: "danger",
  },
}
