import type { Collection } from "@argent/x-shared"
import type { FlexProps } from "@chakra-ui/react"
import { SimpleGrid } from "@chakra-ui/react"
import type { FC, ReactNode } from "react"

import { AccountCollection } from "./AccountCollection"
import { EmptyCollections } from "./EmptyCollections"
import type { BaseWalletAccount } from "../../../shared/wallet.model"

export interface AccountCollectionsProps extends Omit<FlexProps, "onClick"> {
  account: BaseWalletAccount
  collections: Collection[]
  navigateToSend?: boolean
  onCollectionClick?: (collection: Collection) => void
  emptyFallback?: ReactNode
}

export const AccountCollections: FC<AccountCollectionsProps> = ({
  account,
  navigateToSend,
  collections,
  onCollectionClick,
  emptyFallback,
  ...rest
}) => {
  const hasCollectibles = collections.length > 0
  if (!hasCollectibles) {
    return emptyFallback ?? <EmptyCollections {...rest} />
  }
  return (
    <SimpleGrid
      gridTemplateColumns="repeat(auto-fill, minmax(10em, 1fr))"
      gap="2"
      p="4"
      {...rest}
    >
      {collections.map((collection) => (
        <AccountCollection
          account={account}
          key={collection.contractAddress}
          collection={collection}
          navigateToSend={navigateToSend}
          onClick={onCollectionClick}
        />
      ))}
    </SimpleGrid>
  )
}
