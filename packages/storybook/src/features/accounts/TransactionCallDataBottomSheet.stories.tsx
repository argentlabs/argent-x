import { dappAspectBuyNft } from "@argent-x/extension/src/ui/features/accountActivity/transform/explorerTransaction/__test__/__fixtures__/explorer-transactions/goerli-alpha"
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
