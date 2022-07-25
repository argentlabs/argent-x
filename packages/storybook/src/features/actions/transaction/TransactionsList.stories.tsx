import defaultTokens from "@argent-x/extension/src/assets/default-tokens.json"
import { ApiTransactionReviewResponse } from "@argent-x/extension/src/shared/transactionReview.service"
import { TokenDetailsWithBalance } from "@argent-x/extension/src/ui/features/accountTokens/tokens.state"
import { TransactionsList } from "@argent-x/extension/src/ui/features/actions/transaction/TransactionsList"
import { ComponentMeta, ComponentStory } from "@storybook/react"

import erc20TransferResponse from "./__fixtures__/neutral/erc20-transfer-response.json"
import erc20Transfer from "./__fixtures__/neutral/erc20-transfer.json"
import jediSwapMintResponse from "./__fixtures__/neutral/jedi-swap-mint-response.json"
import jediSwapMint from "./__fixtures__/neutral/jedi-swap-mint.json"
import mySwapApproveAndSwapResponse from "./__fixtures__/neutral/my-swap-approve-and-swap-response.json"
import mySwapApproveAndSwap from "./__fixtures__/neutral/my-swap-approve-and-swap.json"
import nftTransferResponse from "./__fixtures__/neutral/nft-transfer-response.json"
import nftTransfer from "./__fixtures__/neutral/nft-transfer.json"
import accountUpgradeUnknownImplementationResponse from "./__fixtures__/warn/account-upgrade-unkown-implementation-response.json"
import accountUpgradeUnknownImplementation from "./__fixtures__/warn/account-upgrade-unkown-implementation.json"
import erc20TransferIsTokenAddressResponse from "./__fixtures__/warn/erc20-transfer-recipient-is-token-address-response.json"
import erc20TransferIsTokenAddress from "./__fixtures__/warn/erc20-transfer-recipient-is-token-address.json"
import erc20TransferWarnResponse from "./__fixtures__/warn/erc20-transfer-warn-response.json"

/** convert to expected types and shape */
const tokensByNetwork: TokenDetailsWithBalance[] = defaultTokens
  .filter(({ network }) => network === "goerli-alpha")
  .map((token) => {
    return {
      ...token,
      networkId: token.network,
      decimals: Number(token.decimals),
    }
  })

export default {
  title: "features/TransactionsList",
  component: TransactionsList,
} as ComponentMeta<typeof TransactionsList>

const Template: ComponentStory<typeof TransactionsList> = (props) => (
  <TransactionsList {...props} tokensByNetwork={tokensByNetwork} />
)

export const Erc20Transfer = Template.bind({})
Erc20Transfer.args = {
  transactions: erc20Transfer,
  transactionReview: erc20TransferResponse as ApiTransactionReviewResponse,
}

export const Erc20TransferIsTokenAddress = Template.bind({})
Erc20TransferIsTokenAddress.args = {
  transactions: erc20TransferIsTokenAddress,
  transactionReview:
    erc20TransferIsTokenAddressResponse as ApiTransactionReviewResponse,
}

export const Erc20TransferWarn = Template.bind({})
Erc20TransferWarn.args = {
  transactions: erc20Transfer,
  transactionReview: erc20TransferWarnResponse as ApiTransactionReviewResponse,
}

export const MySwapApproveAndSwap = Template.bind({})
MySwapApproveAndSwap.args = {
  transactions: mySwapApproveAndSwap,
  transactionReview:
    mySwapApproveAndSwapResponse as ApiTransactionReviewResponse,
}

export const JediSwapMint = Template.bind({})
JediSwapMint.args = {
  transactions: jediSwapMint,
  transactionReview: jediSwapMintResponse as ApiTransactionReviewResponse,
}

export const NftTransfer = Template.bind({})
NftTransfer.args = {
  transactions: nftTransfer,
  transactionReview: nftTransferResponse as ApiTransactionReviewResponse,
}

export const AccountUpgradeUnknownImplementation = Template.bind({})
AccountUpgradeUnknownImplementation.args = {
  transactions: accountUpgradeUnknownImplementation,
  transactionReview:
    accountUpgradeUnknownImplementationResponse as ApiTransactionReviewResponse,
}
