import { Collection, addressSchema } from "@argent/shared"
import { Empty, H4, icons } from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { FC, Suspense } from "react"

import { BaseWalletAccount } from "../../../shared/wallet.model"
import { Spinner } from "../../components/Spinner"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import { useIsDefaultNetwork } from "../networks/hooks/useIsDefaultNetwork"
import { AccountCollections } from "./AccountCollections"
import { useCollectionsByAccountAndNetwork } from "./nfts.state"

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
  const isDefaultNetwork = useIsDefaultNetwork()
  const network = useCurrentNetwork()

  const ownedCollections = useCollectionsByAccountAndNetwork(
    addressSchema.parse(account.address),
    account.networkId,
  )

  if (!isDefaultNetwork) {
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
