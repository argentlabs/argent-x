import { dappAspectBuyNft } from "@argent-x/extension/src/shared/activity/utils/transform/explorerTransaction/__fixtures__/explorer-transactions/sepolia-alpha"
import { TransactionCallDataBottomSheet } from "@argent-x/extension/src/ui/features/accountActivity/ui/TransactionCallDataBottomSheet"

export default {
  component: TransactionCallDataBottomSheet,
}

export const Default = {
  args: {
    calls: dappAspectBuyNft.calls,
    open: true,
  },
}
