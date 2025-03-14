import { NetworkSecondaryIcon } from "@argent/x-ui/icons"
import { CellStack, Empty, H3, SpacerCell } from "@argent/x-ui"
import { Center } from "@chakra-ui/react"
import { isEmpty } from "lodash-es"
import type { FC } from "react"

import type { NewsItem } from "../../../shared/discover/schema"
import { NewsItemCardCollection } from "./ui/NewsItemCardCollection"

interface AccountDiscoverScreenProps {
  newsItems?: NewsItem[]
}

export const AccountDiscoverScreen: FC<AccountDiscoverScreenProps> = ({
  newsItems,
}) => {
  const hasNewsItems = newsItems && !isEmpty(newsItems)
  return (
    <CellStack flex={1} pt={2}>
      <Center>
        <H3>Discover</H3>
      </Center>
      <SpacerCell />
      {hasNewsItems ? (
        <NewsItemCardCollection newsItems={newsItems} />
      ) : (
        <Empty
          icon={<NetworkSecondaryIcon />}
          title={
            <>
              No updates.
              <br />
              Check back soon 👀
            </>
          }
        />
      )}
    </CellStack>
  )
}
