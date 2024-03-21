import { TransactionBanner } from "@argent-x/extension/src/ui/features/actions/transaction/ApproveTransactionScreen/TransactionBanner"
import { icons } from "@argent/x-ui"

const { AlertFillIcon, TickCircleIcon } = icons

export default {
  component: TransactionBanner,
}

export const Default = {
  args: {
    variant: "neutral",
    message: "This transaction has been verified.",
    icon: TickCircleIcon,
  },
}

export const Warn = {
  args: {
    variant: "warn",
    message:
      "This transaction has been flagged as dangerous. We recommend you reject this transaction unless you are sure.",
    icon: AlertFillIcon,
  },
}
