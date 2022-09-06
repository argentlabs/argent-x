import { dappAspectBuyNft } from "@argent-x/extension/src/ui/features/accountActivity/transform/explorerTransaction/__test__/__fixtures__/explorer-transactions/goerli-alpha"
import { TransactionCallDataBottomSheet } from "@argent-x/extension/src/ui/features/accountActivity/ui/TransactionCallDataBottomSheet"
import { ComponentMeta, ComponentStory } from "@storybook/react"

export default {
  title: "accounts/TransactionCallDataBottomSheet",
  component: TransactionCallDataBottomSheet,
} as ComponentMeta<typeof TransactionCallDataBottomSheet>

const Template: ComponentStory<typeof TransactionCallDataBottomSheet> = (
  props,
) => (
  <TransactionCallDataBottomSheet {...props}></TransactionCallDataBottomSheet>
)

export const Default = Template.bind({})
Default.args = {
  calls: dappAspectBuyNft.calls,
  open: true,
}
