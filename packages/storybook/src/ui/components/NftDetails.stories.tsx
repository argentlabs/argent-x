import { aspect } from "@argent-x/extension/src/ui/features/actions/__fixtures__"
import { DetailAccordion, DetailAccordionItem, NftDetails } from "@argent/ui"
import { ComponentProps } from "react"

export default {
  component: NftDetails,
  render: (props: ComponentProps<typeof NftDetails>) => (
    <DetailAccordion>
      <DetailAccordionItem>
        <NftDetails {...props} />
      </DetailAccordionItem>
    </DetailAccordion>
  ),
}

const { aggregatedData } = aspect
const dataIndex = 0
const { amount, token, usdValue, safe } = aggregatedData[dataIndex]
const isDisabled = false

export const Default = {
  args: {
    contractAddress: token.address,
    tokenId: token.tokenId,
    networkId: token.networkId,
    dataIndex,
    totalData: aggregatedData.length,
    amount,
    usdValue,
    safe,
    isDisabled,
  },
}
