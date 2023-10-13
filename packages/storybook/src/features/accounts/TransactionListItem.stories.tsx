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
import { ComponentProps, FC } from "react"

import { decorators } from "../../decorators/routerDecorators"
import { tokensByNetwork } from "../../tokens"

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
  component: TransactionListItem,
  decorators,
  parameters: {
    layout: "fullscreen",
  },
}

const Default = {
  render: (props: ComponentProps<typeof TransactionListItemWrapped>) => (
    <TransactionListItemWrapped {...props}></TransactionListItemWrapped>
  ),
}

const network = defaultNetwork

export const AccountCreated = {
  ...Default,
  args: {
    explorerTransaction: accountCreated as IExplorerTransaction,
    network,
  },
}

export const AccountUpgrade = {
  ...Default,
  args: {
    explorerTransaction: accountUpgrade as IExplorerTransaction,
    network,
  },
}

export const DappAspectBuyNft = {
  ...Default,
  args: {
    explorerTransaction: dappAspectBuyNft as IExplorerTransaction,
    network,
  },
}

export const DappBriq = {
  ...Default,
  args: {
    explorerTransaction: dappBriq as IExplorerTransaction,
    network,
  },
}

export const DappInfluenceCrewmatePurchaseNft = {
  ...Default,
  args: {
    explorerTransaction:
      dappInfluenceCrewmatePurchaseNft as IExplorerTransaction,
    network,
  },
}

export const DappMintSquareBuyNft = {
  ...Default,
  args: {
    explorerTransaction: dappMintSquareBuyNft as IExplorerTransaction,
    network,
  },
}

export const DappNoGame = {
  ...Default,
  args: {
    explorerTransaction: dappNoGame as IExplorerTransaction,
    network,
  },
}

export const Erc20MintTestToken = {
  ...Default,
  args: {
    explorerTransaction: erc20MintTestToken as IExplorerTransaction,
    network,
  },
}

export const Erc20SwapAlphaRoad = {
  ...Default,
  args: {
    explorerTransaction: erc20SwapAlphaRoad as IExplorerTransaction,
    network,
  },
}

export const Erc20SwapJediswap = {
  ...Default,
  args: {
    explorerTransaction: erc20SwapJediswap as IExplorerTransaction,
    network,
  },
}

export const Erc20SwapMySwap = {
  ...Default,
  args: {
    explorerTransaction: erc20SwapMySwap as IExplorerTransaction,
    network,
  },
}

export const Erc20Transfer = {
  ...Default,
  args: {
    explorerTransaction: erc20Transfer as IExplorerTransaction,
    network,
  },
}

export const Erc20Send = {
  ...Default,
  args: {
    explorerTransaction: erc20Transfer as IExplorerTransaction,
    network,
    accountAddress:
      "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
  },
}

export const Erc20Receive = {
  ...Default,
  args: {
    explorerTransaction: erc20Transfer as IExplorerTransaction,
    network,
    accountAddress:
      "0x69b49c2cc8b16e80e86bfc5b0614a59aa8c9b601569c7b80dde04d3f3151b79",
  },
}

export const Erc20Approve = {
  ...Default,
  args: {
    explorerTransaction: erc20Approve as IExplorerTransaction,
    network,
  },
}

export const Erc20ApproveUnlimited = {
  ...Default,
  args: {
    explorerTransaction: erc20ApproveUnlimited as IExplorerTransaction,
    network,
  },
}

export const Erc721MintAspect = {
  ...Default,
  args: {
    explorerTransaction: erc721MintAspect as IExplorerTransaction,
    network,
  },
}

export const Erc721Transfer = {
  ...Default,
  args: {
    explorerTransaction: erc721Transfer as IExplorerTransaction,
    network,
  },
}

export const Erc721Send = {
  ...Default,
  args: {
    explorerTransaction: erc721Transfer as IExplorerTransaction,
    network,
    accountAddress:
      "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
  },
}

export const Erc721Receive = {
  ...Default,
  args: {
    explorerTransaction: erc721Transfer as IExplorerTransaction,
    network,
    accountAddress:
      "0x69b49c2cc8b16e80e86bfc5b0614a59aa8c9b601569c7b80dde04d3f3151b79",
  },
}
