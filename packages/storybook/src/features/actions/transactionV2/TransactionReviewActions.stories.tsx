import { CellStack } from "@argent/ui"
import { ComponentProps } from "react"
import { uint256 } from "starknet"
import { cloneDeep } from "lodash-es"

import { TransactionReviewActions } from "@argent-x/extension/src/ui/features/actions/transactionV2/action/TransactionReviewActions"

import multisigAdd from "@argent-x/extension/src/shared/transactionReview/__fixtures__/multisig-add.json"
import multisigChange from "@argent-x/extension/src/shared/transactionReview/__fixtures__/multisig-change.json"
import nonNativeJediswap from "@argent-x/extension/src/shared/transactionReview/__fixtures__/non-native-jediswap.json"
import mintNft from "@argent-x/extension/src/shared/transactionReview/__fixtures__/mint-nft.json"
import sendNft from "@argent-x/extension/src/shared/transactionReview/__fixtures__/send-nft.json"
import sendNftSelf from "@argent-x/extension/src/shared/transactionReview/__fixtures__/send-nft-self.json"
import send from "@argent-x/extension/src/shared/transactionReview/__fixtures__/send.json"
import shieldAdd from "@argent-x/extension/src/shared/transactionReview/__fixtures__/shield-add.json"
import shieldRemove from "@argent-x/extension/src/shared/transactionReview/__fixtures__/shield-remove.json"
import shieldKeep from "@argent-x/extension/src/shared/transactionReview/__fixtures__/shield-keep.json"
import swap from "@argent-x/extension/src/shared/transactionReview/__fixtures__/swap.json"
import upgrade from "@argent-x/extension/src/shared/transactionReview/__fixtures__/upgrade.json"

const swapApproveUnlimited = cloneDeep(swap)
swapApproveUnlimited.transactions[0].reviewOfTransaction.reviews[0].action.properties[0].amount =
  String(uint256.UINT_256_MAX)

export default {
  component: TransactionReviewActions,
  render: (props: ComponentProps<typeof TransactionReviewActions>) => (
    <CellStack>
      <TransactionReviewActions
        {...props}
        initiallyExpanded
      ></TransactionReviewActions>
    </CellStack>
  ),
  parameters: {
    layout: "fullscreen",
  },
}

export const MultisigAdd = {
  args: {
    reviewOfTransaction: multisigAdd.transactions[0].reviewOfTransaction,
  },
}

export const MultisigChange = {
  args: {
    reviewOfTransaction: multisigChange.transactions[0].reviewOfTransaction,
  },
}

export const NonNativeJediswap = {
  args: {
    reviewOfTransaction: nonNativeJediswap.transactions[0].reviewOfTransaction,
  },
}

export const MintNFT = {
  args: {
    reviewOfTransaction: mintNft.transactions[0].reviewOfTransaction,
  },
}

export const SendNft = {
  args: {
    reviewOfTransaction: sendNft.transactions[0].reviewOfTransaction,
  },
}

export const SendNftSelf = {
  args: {
    reviewOfTransaction: sendNftSelf.transactions[0].reviewOfTransaction,
  },
}

export const Send = {
  args: {
    reviewOfTransaction: send.transactions[0].reviewOfTransaction,
  },
}

export const ShieldAdd = {
  args: {
    reviewOfTransaction: shieldAdd.transactions[0].reviewOfTransaction,
  },
}

export const ShieldRemove = {
  args: {
    reviewOfTransaction: shieldRemove.transactions[0].reviewOfTransaction,
  },
}

export const ShieldKeep = {
  args: {
    reviewOfTransaction: shieldKeep.transactions[0].reviewOfTransaction,
  },
}

export const Swap = {
  args: {
    reviewOfTransaction: swap.transactions[0].reviewOfTransaction,
  },
}

export const SwapApproveUnlimited = {
  args: {
    reviewOfTransaction:
      swapApproveUnlimited.transactions[0].reviewOfTransaction,
  },
}

export const Upgrade = {
  args: {
    reviewOfTransaction: upgrade.transactions[0].reviewOfTransaction,
  },
}
