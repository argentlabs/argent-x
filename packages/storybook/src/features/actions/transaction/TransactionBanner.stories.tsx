import { CheckCircleOutlineIcon } from "@argent-x/extension/src/ui/components/Icons/MuiIcons"
import { WarningIcon } from "@argent-x/extension/src/ui/components/Icons/WarningIcon"
import { TransactionBanner } from "@argent-x/extension/src/ui/features/actions/transaction/ApproveTransactionScreen/TransactionBanner"
import { ComponentMeta, ComponentStory } from "@storybook/react"

export default {
  title: "features/TransactionBanner",
  component: TransactionBanner,
} as ComponentMeta<typeof TransactionBanner>

const Template: ComponentStory<typeof TransactionBanner> = (props) => (
  <TransactionBanner {...props}></TransactionBanner>
)

export const Default = Template.bind({})
Default.args = {
  variant: "neutral",
  message: "This transaction has been verified.",
  icon: CheckCircleOutlineIcon,
}

export const Warn = Template.bind({})
Warn.args = {
  variant: "warn",
  message:
    "This transaction has been flagged as dangerous. We recommend you reject this transaction unless you are sure.",
  icon: WarningIcon,
}
