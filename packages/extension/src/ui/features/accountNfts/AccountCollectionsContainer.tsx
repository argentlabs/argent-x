import { Collection, addressSchema, getAccountIdentifier } from "@argent/shared"
import { Empty, H4, icons } from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { FC, Suspense } from "react"

import { BaseWalletAccount } from "../../../shared/wallet.model"
import { Spinner } from "../../components/Spinner"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import { AccountCollections } from "./AccountCollections"
import { useCollectionsByAccountAndNetwork } from "./nfts.state"
import { useKeyValueStorage } from "../../../shared/storage/hooks"
import { nftWorkerStore } from "../../../shared/nft/worker/store"
import { nftService } from "../../services/nfts"

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
  const accountIdentifier = getAccountIdentifier(account)
  const loadingState = useKeyValueStorage(nftWorkerStore, accountIdentifier)

  const lastUpdatedTimestamp = loadingState?.lastUpdatedTimestamp || 0
  const isInitialised = lastUpdatedTimestamp !== 0

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

  if (!isInitialised) {
    return (
      <Flex
        direction="column"
        alignItems={"center"}
        justifyContent={"center"}
        flex={1}
        {...rest}
      >
        <Spinner size={64} />
      </Flex>
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
