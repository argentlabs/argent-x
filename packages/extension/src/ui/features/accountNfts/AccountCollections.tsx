import { Collection } from "@argent/shared"
import { SimpleGrid, SimpleGridProps } from "@chakra-ui/react"
import { FC } from "react"

import { AccountCollection } from "./AccountCollection"
import { EmptyCollections } from "./EmptyCollections"

export interface AccountCollectionsProps
  extends Omit<SimpleGridProps, "onClick"> {
  networkId: string
  collections: Collection[]
  navigateToSend?: boolean
  onCollectionClick?: (collection: Collection) => void
}

export const AccountCollections: FC<AccountCollectionsProps> = ({
  networkId,
  navigateToSend,
  collections,
  onCollectionClick,
  ...rest
}) => {
  const hasCollectibles = collections.length > 0
  if (!hasCollectibles) {
    return <EmptyCollections networkId={networkId} />
  }
  return (
    <SimpleGrid
      gridTemplateColumns="repeat(auto-fill, minmax(155px, 1fr))"
      gap="3"
      p="4"
      {...rest}
    >
      {collections.map((collection) => (
        <AccountCollection
          key={collection.contractAddress}
          collection={collection}
          navigateToSend={navigateToSend}
          onClick={onCollectionClick}
        />
      ))}
    </SimpleGrid>
  )
}
