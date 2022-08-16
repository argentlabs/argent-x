import { IExplorerTransaction } from "@argent-x/extension/src/shared/explorer/type"
import { defaultNetwork } from "@argent-x/extension/src/shared/network"
import {
  accountCreated,
  accountUpgrade,
  dappAspectBuyNft,
  dappBriq,
  dappMintSquareBuyNft,
  dappNoGame,
  erc20MintTestToken,
  erc20SwapAlphaRoad,
  erc20SwapJediswap,
  erc20SwapMySwap,
  erc20Transfer,
  erc721MintAspect,
  erc721Transfer,
} from "@argent-x/extension/src/ui/features/accountActivity/__test__/__fixtures__/explorer-transactions/goerli-alpha"
import {
  ExplorerTransactionDetail,
  IExplorerTransactionDetail,
} from "@argent-x/extension/src/ui/features/accountActivity/ExplorerTransactionDetail"
import { transformExplorerTransaction } from "@argent-x/extension/src/ui/features/accountActivity/transform/transformExplorerTransaction"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { FC } from "react"
import { MemoryRouter } from "react-router-dom"

import { tokensByNetwork } from "../../tokensByNetwork"

interface IExplorerTransactionDetailWrapped
  extends Omit<IExplorerTransactionDetail, "explorerTransactionTransformed"> {
  accountAddress: string
}

const ExplorerTransactionDetailWrapped: FC<
  IExplorerTransactionDetailWrapped
> = ({ explorerTransaction, accountAddress, ...rest }) => {
  const explorerTransactionTransformed = transformExplorerTransaction({
    explorerTransaction,
    accountAddress,
  })
  if (!explorerTransactionTransformed) {
    return null
  }
  return (
    <ExplorerTransactionDetail
      explorerTransaction={explorerTransaction}
      explorerTransactionTransformed={explorerTransactionTransformed}
      {...rest}
    ></ExplorerTransactionDetail>
  )
}

export default {
  title: "accounts/ExplorerTransactionDetail",
  component: ExplorerTransactionDetail,
} as ComponentMeta<typeof ExplorerTransactionDetail>

const Template: ComponentStory<typeof ExplorerTransactionDetailWrapped> = (
  props,
) => (
  <MemoryRouter initialEntries={["/"]}>
    <ExplorerTransactionDetailWrapped
      {...props}
    ></ExplorerTransactionDetailWrapped>
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
    "0x5f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
}

export const Erc20Receive = Template.bind({})
Erc20Receive.args = {
  explorerTransaction: erc20Transfer as IExplorerTransaction,
  network,
  tokensByNetwork,
  accountAddress:
    "0x5417fc252d9b7b6ea311485a9e946cc814e3aa4d00f740f7e5f6b11ce0db9fa",
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
    "0x5f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
}

export const Erc721Receive = Template.bind({})
Erc721Receive.args = {
  explorerTransaction: erc721Transfer as IExplorerTransaction,
  network,
  tokensByNetwork,
  accountAddress:
    "0x5417fc252d9b7b6ea311485a9e946cc814e3aa4d00f740f7e5f6b11ce0db9fa",
}
