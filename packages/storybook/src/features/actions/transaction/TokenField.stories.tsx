import { FieldGroup } from "@argent-x/extension/src/ui/components/Fields"
import { TokenField } from "@argent-x/extension/src/ui/features/actions/transaction/fields/TokenField"
import { ComponentProps } from "react"

import { tokensByNetwork } from "../../../tokens"

export default {
  component: TokenField,
}

const Default = {
  render: (props: ComponentProps<typeof TokenField>) => (
    <FieldGroup>
      <TokenField {...props} tokensByNetwork={tokensByNetwork} />
    </FieldGroup>
  ),
}

export const ETH = {
  ...Default,
  args: {
    label: "Send",
    contractAddress: tokensByNetwork[0].address,
    amount: String(1e18),
    tokensByNetwork,
  },
}

export const STRK = {
  ...Default,
  args: {
    label: "Send",
    contractAddress: tokensByNetwork[1].address,
    amount: String(1e18),
    tokensByNetwork,
  },
}
