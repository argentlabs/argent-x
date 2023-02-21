import { IExplorerTransaction } from "@argent-x/extension/src/shared/explorer/type"
import { defaultNetwork } from "@argent-x/extension/src/shared/network"
import {
  TransactionListItem,
  TransactionListItemProps,
} from "@argent-x/extension/src/ui/features/accountActivity/TransactionListItem"
import { transformExplorerTransaction } from "@argent-x/extension/src/ui/features/accountActivity/transform"
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
import { CellStack } from "@argent/ui"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { FC } from "react"
import { MemoryRouter } from "react-router-dom"

import { tokensByNetwork } from "../../tokensByNetwork"

interface ITransactionListItemWrapped
  extends Omit<TransactionListItemProps, "transactionTransformed"> {
  accountAddress: string
  explorerTransaction: IExplorerTransaction
}

const TransactionListItemWrapped: FC<ITransactionListItemWrapped> = ({
  explorerTransaction,
  accountAddress,
  ...rest
}) => {
  const transactionTransformed = transformExplorerTransaction({
    explorerTransaction,
    accountAddress,
    tokensByNetwork,
  })
  if (!transactionTransformed) {
    return null
  }
  return (
    <CellStack>
      <TransactionListItem
        transactionTransformed={transactionTransformed}
        {...rest}
      ></TransactionListItem>
    </CellStack>
  )
}

export default {
  title: "accounts/TransactionListItem",
  component: TransactionListItem,
} as ComponentMeta<typeof TransactionListItem>

const Template: ComponentStory<typeof TransactionListItemWrapped> = (props) => (
  <MemoryRouter initialEntries={["/"]}>
    <TransactionListItemWrapped {...props}></TransactionListItemWrapped>
  </MemoryRouter>
)

const network = defaultNetwork

export const AccountCreated = Template.bind({})
AccountCreated.args = {
  explorerTransaction: accountCreated as IExplorerTransaction,
  network,
}

export const AccountUpgrade = Template.bind({})
AccountUpgrade.args = {
  explorerTransaction: accountUpgrade as IExplorerTransaction,
  network,
}

export const DappAspectBuyNft = Template.bind({})
DappAspectBuyNft.args = {
  explorerTransaction: dappAspectBuyNft as IExplorerTransaction,
  network,
}

export const DappBriq = Template.bind({})
DappBriq.args = {
  explorerTransaction: dappBriq as IExplorerTransaction,
  network,
}

export const DappInfluenceCrewmatePurchaseNft = Template.bind({})
DappInfluenceCrewmatePurchaseNft.args = {
  explorerTransaction: dappInfluenceCrewmatePurchaseNft as IExplorerTransaction,
  network,
}

export const DappMintSquareBuyNft = Template.bind({})
DappMintSquareBuyNft.args = {
  explorerTransaction: dappMintSquareBuyNft as IExplorerTransaction,
  network,
}

export const DappNoGame = Template.bind({})
DappNoGame.args = {
  explorerTransaction: dappNoGame as IExplorerTransaction,
  network,
}

export const Erc20MintTestToken = Template.bind({})
Erc20MintTestToken.args = {
  explorerTransaction: erc20MintTestToken as IExplorerTransaction,
  network,
}

export const Erc20SwapAlphaRoad = Template.bind({})
Erc20SwapAlphaRoad.args = {
  explorerTransaction: erc20SwapAlphaRoad as IExplorerTransaction,
  network,
}

export const Erc20SwapJediswap = Template.bind({})
Erc20SwapJediswap.args = {
  explorerTransaction: erc20SwapJediswap as IExplorerTransaction,
  network,
}

export const Erc20SwapMySwap = Template.bind({})
Erc20SwapMySwap.args = {
  explorerTransaction: erc20SwapMySwap as IExplorerTransaction,
  network,
}

export const Erc20Transfer = Template.bind({})
Erc20Transfer.args = {
  explorerTransaction: erc20Transfer as IExplorerTransaction,
  network,
}

export const Erc20Send = Template.bind({})
Erc20Send.args = {
  explorerTransaction: erc20Transfer as IExplorerTransaction,
  network,
  accountAddress:
    "0x5f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
}

export const Erc20Receive = Template.bind({})
Erc20Receive.args = {
  explorerTransaction: erc20Transfer as IExplorerTransaction,
  network,
  accountAddress:
    "0x5417fc252d9b7b6ea311485a9e946cc814e3aa4d00f740f7e5f6b11ce0db9fa",
}

export const Erc20Approve = Template.bind({})
Erc20Approve.args = {
  explorerTransaction: erc20Approve as IExplorerTransaction,
  network,
}

export const Erc20ApproveUnlimited = Template.bind({})
Erc20ApproveUnlimited.args = {
  explorerTransaction: erc20ApproveUnlimited as IExplorerTransaction,
  network,
}

export const Erc721MintAspect = Template.bind({})
Erc721MintAspect.args = {
  explorerTransaction: erc721MintAspect as IExplorerTransaction,
  network,
}

export const Erc721Transfer = Template.bind({})
Erc721Transfer.args = {
  explorerTransaction: erc721Transfer as IExplorerTransaction,
  network,
}

export const Erc721Send = Template.bind({})
Erc721Send.args = {
  explorerTransaction: erc721Transfer as IExplorerTransaction,
  network,
  accountAddress:
    "0x5f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
}

export const Erc721Receive = Template.bind({})
Erc721Receive.args = {
  explorerTransaction: erc721Transfer as IExplorerTransaction,
  network,
  accountAddress:
    "0x5417fc252d9b7b6ea311485a9e946cc814e3aa4d00f740f7e5f6b11ce0db9fa",
}
