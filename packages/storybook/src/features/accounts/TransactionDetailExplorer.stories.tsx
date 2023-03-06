import { IExplorerTransaction } from "@argent-x/extension/src/shared/explorer/type"
import { defaultNetwork } from "@argent-x/extension/src/shared/network"
import { TransactionDetail } from "@argent-x/extension/src/ui/features/accountActivity/TransactionDetail"
import {
  accountCreated,
  accountUpgrade,
  dappAspectBuyNft,
  dappBriq,
  dappInfluenceCrewmatePurchaseNft,
  dappMintSquareBuyNft,
  dappNoGame,
  erc20Approve,
  erc20ApproveUnlimited,
  erc20MintTestToken,
  erc20SwapAlphaRoad,
  erc20SwapJediswap,
  erc20SwapMySwap,
  erc20Transfer,
  erc721MintAspect,
  erc721Transfer,
} from "@argent-x/extension/src/ui/features/accountActivity/transform/explorerTransaction/__test__/__fixtures__/explorer-transactions/goerli-alpha"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"

import { tokensByNetwork } from "../../tokensByNetwork"
import { TransactionDetailWrapped } from "./TransactionDetailWrapped"

export default {
  title: "accounts/TransactionDetail (Explorer)",
  component: TransactionDetail,
} as ComponentMeta<typeof TransactionDetail>

const Template: ComponentStory<typeof TransactionDetailWrapped> = (props) => (
  <MemoryRouter initialEntries={["/"]}>
    <TransactionDetailWrapped {...props}></TransactionDetailWrapped>
  </MemoryRouter>
)

const network = defaultNetwork

export const AccountCreated = Template.bind({})
AccountCreated.args = {
  explorerTransaction: accountCreated as IExplorerTransaction,
  network,
  tokensByNetwork,
}

export const AccountUpgrade = Template.bind({})
AccountUpgrade.args = {
  explorerTransaction: accountUpgrade as IExplorerTransaction,
  network,
  tokensByNetwork,
}

export const DappAspectBuyNft = Template.bind({})
DappAspectBuyNft.args = {
  explorerTransaction: dappAspectBuyNft as IExplorerTransaction,
  network,
  tokensByNetwork,
}

export const DappBriq = Template.bind({})
DappBriq.args = {
  explorerTransaction: dappBriq as IExplorerTransaction,
  network,
  tokensByNetwork,
}

export const DappInfluenceCrewmatePurchaseNft = Template.bind({})
DappInfluenceCrewmatePurchaseNft.args = {
  explorerTransaction: dappInfluenceCrewmatePurchaseNft as IExplorerTransaction,
  network,
  tokensByNetwork,
}

export const DappMintSquareBuyNft = Template.bind({})
DappMintSquareBuyNft.args = {
  explorerTransaction: dappMintSquareBuyNft as IExplorerTransaction,
  network,
  tokensByNetwork,
}

export const DappNoGame = Template.bind({})
DappNoGame.args = {
  explorerTransaction: dappNoGame as IExplorerTransaction,
  network,
  tokensByNetwork,
}

export const Erc20MintTestToken = Template.bind({})
Erc20MintTestToken.args = {
  explorerTransaction: erc20MintTestToken as IExplorerTransaction,
  network,
  tokensByNetwork,
}

export const Erc20SwapAlphaRoad = Template.bind({})
Erc20SwapAlphaRoad.args = {
  explorerTransaction: erc20SwapAlphaRoad as IExplorerTransaction,
  network,
  tokensByNetwork,
}

export const Erc20SwapJediswap = Template.bind({})
Erc20SwapJediswap.args = {
  explorerTransaction: erc20SwapJediswap as IExplorerTransaction,
  network,
  tokensByNetwork,
}

export const Erc20SwapMySwap = Template.bind({})
Erc20SwapMySwap.args = {
  explorerTransaction: erc20SwapMySwap as IExplorerTransaction,
  network,
  tokensByNetwork,
}

export const Erc20Transfer = Template.bind({})
Erc20Transfer.args = {
  explorerTransaction: erc20Transfer as IExplorerTransaction,
  network,
  tokensByNetwork,
}

export const Erc20Send = Template.bind({})
Erc20Send.args = {
  explorerTransaction: erc20Transfer as IExplorerTransaction,
  network,
  tokensByNetwork,
  accountAddress:
    "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
}

export const Erc20Receive = Template.bind({})
Erc20Receive.args = {
  explorerTransaction: erc20Transfer as IExplorerTransaction,
  network,
  tokensByNetwork,
  accountAddress:
    "0x69b49c2cc8b16e80e86bfc5b0614a59aa8c9b601569c7b80dde04d3f3151b79",
}

export const Erc20Approve = Template.bind({})
Erc20Approve.args = {
  explorerTransaction: erc20Approve as IExplorerTransaction,
  network,
  tokensByNetwork,
}

export const Erc20ApproveUnlimited = Template.bind({})
Erc20ApproveUnlimited.args = {
  explorerTransaction: erc20ApproveUnlimited as IExplorerTransaction,
  network,
  tokensByNetwork,
}

export const Erc721MintAspect = Template.bind({})
Erc721MintAspect.args = {
  explorerTransaction: erc721MintAspect as IExplorerTransaction,
  network,
  tokensByNetwork,
}

export const Erc721Transfer = Template.bind({})
Erc721Transfer.args = {
  explorerTransaction: erc721Transfer as IExplorerTransaction,
  network,
  tokensByNetwork,
}

export const Erc721Send = Template.bind({})
Erc721Send.args = {
  explorerTransaction: erc721Transfer as IExplorerTransaction,
  network,
  tokensByNetwork,
  accountAddress:
    "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
}
