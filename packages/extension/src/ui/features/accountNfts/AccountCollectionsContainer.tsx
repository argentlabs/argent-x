import { Collection, addressSchema } from "@argent/x-shared"
import { Empty, H4, icons } from "@argent/x-ui"
import { Flex } from "@chakra-ui/react"
import { FC, Suspense } from "react"

import { BaseWalletAccount } from "../../../shared/wallet.model"
import { Spinner } from "../../components/Spinner"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import { AccountCollections } from "./AccountCollections"
import { useCollectionsByAccountAndNetwork } from "./nfts.state"
import { nftService } from "../../../shared/nft"

const { NftIcon } = icons

interface AccountCollectionsContainerProps {
  account: BaseWalletAccount
  withHeader?: boolean
  customList?: Collection[]
  navigateToSend?: boolean
}

export const AccountCollectionsContainer: FC<
  AccountCollectionsContainerProps
> = ({ account, withHeader = true, customList, navigateToSend, ...rest }) => {
  const network = useCurrentNetwork()
  const isSupported = nftService.isSupported(network)

  const ownedCollections = useCollectionsByAccountAndNetwork(
    addressSchema.parse(account.address),
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
      {withHeader && <H4 textAlign="center">NFTs</H4>}
      <Flex direction="column" flex={1} {...rest}>
        <Suspense fallback={<Spinner size={64} style={{ marginTop: 40 }} />}>
          <AccountCollections
            networkId={account.networkId}
            collections={customList ?? ownedCollections}
            navigateToSend={navigateToSend}
          />
        </Suspense>
      </Flex>
    </>
  )
}
