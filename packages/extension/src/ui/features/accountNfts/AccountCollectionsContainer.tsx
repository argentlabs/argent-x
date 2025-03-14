import type { Address, Collection } from "@argent/x-shared"
import { NftIcon } from "@argent/x-ui/icons"
import { Empty, H3 } from "@argent/x-ui"
import type { FC, ReactNode } from "react"

import type { BaseWalletAccount } from "../../../shared/wallet.model"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import type { AccountCollectionsProps } from "./AccountCollections"
import { AccountCollections } from "./AccountCollections"
import { useCollectionsByAccountAndNetwork } from "./nfts.state"
import { nftService } from "../../../shared/nft"

interface AccountCollectionsContainerProps
  extends Omit<AccountCollectionsProps, "collections"> {
  account: BaseWalletAccount
  withHeader?: boolean
  customList?: Collection[]
  navigateToSend?: boolean
  emptyFallback?: ReactNode
}

export const AccountCollectionsContainer: FC<
  AccountCollectionsContainerProps
> = ({
  account,
  withHeader = true,
  customList,
  navigateToSend,
  emptyFallback,
  ...rest
}) => {
  const network = useCurrentNetwork()
  const isSupported = nftService.isSupported(network)

  const ownedCollections = useCollectionsByAccountAndNetwork(
    account.address as Address,
    account.networkId,
  )

  if (!isSupported) {
    const displayName = network.name ?? "this network"
    return (
      <Empty
        icon={<NftIcon />}
        title={`NFTs are not supported on ${displayName} right now`}
      />
    )
  }

  return (
    <>
      {withHeader && <H3 textAlign="center">NFTs</H3>}
      <AccountCollections
        account={account}
        collections={customList ?? ownedCollections}
        navigateToSend={navigateToSend}
        emptyFallback={emptyFallback}
        {...rest}
      />
    </>
  )
}
