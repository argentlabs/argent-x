import { TransactionActions } from "@argent-x/extension/src/ui/features/actions/transaction/ApproveTransactionScreen/TransactionActions"
import { ComponentMeta, ComponentStory } from "@storybook/react"

import { frenslandCalls, jediswapCalls } from "./__fixtures__/calldata/generic"

export default {
  title: "features/TransactionActions",
  component: TransactionActions,
} as ComponentMeta<typeof TransactionActions>

const Template: ComponentStory<typeof TransactionActions> = (props) => (
  <TransactionActions {...props} />
)

export const FrensLand = Template.bind({})
FrensLand.args = {
  transactions: frenslandCalls,
}

export const Jediswap = Template.bind({})
Jediswap.args = {
  transactions: jediswapCalls,
}
