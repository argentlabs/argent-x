import { FieldGroup } from "@argent-x/extension/src/ui/components/Fields"
import { TokenField } from "@argent-x/extension/src/ui/features/actions/transaction/fields/TokenField"
import { ComponentMeta, ComponentStory } from "@storybook/react"

import { tokensByNetwork } from "../../../tokensByNetwork"

export default {
  title: "features/TokenField",
  component: TokenField,
} as ComponentMeta<typeof TokenField>

const Template: ComponentStory<typeof TokenField> = (props) => (
  <FieldGroup>
    <TokenField {...props} tokensByNetwork={tokensByNetwork} />
  </FieldGroup>
)

export const ETH = Template.bind({})
ETH.args = {
  label: "Send",
  contractAddress: tokensByNetwork[0].address,
  amount: String(1e18),
  tokensByNetwork,
}

export const DAI = Template.bind({})
DAI.args = {
  label: "Send",
  contractAddress: tokensByNetwork[1].address,
  amount: String(1e18),
  tokensByNetwork,
}

export const WBTC = Template.bind({})
WBTC.args = {
  label: "Send",
  contractAddress: tokensByNetwork[2].address,
  amount: String(1e12),
  tokensByNetwork,
}

export const USDC = Template.bind({})
USDC.args = {
  label: "Send",
  contractAddress: tokensByNetwork[3].address,
  amount: String(1e12),
  tokensByNetwork,
}
