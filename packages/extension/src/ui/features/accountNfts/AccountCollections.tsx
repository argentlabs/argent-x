import { H4 } from "@argent/ui"
import { Flex, SimpleGrid } from "@chakra-ui/react"
import { FC, Suspense } from "react"
import { useNavigate } from "react-router-dom"

import { ErrorBoundary } from "../../components/ErrorBoundary"
import { ErrorBoundaryFallback } from "../../components/ErrorBoundaryFallback"
import { Spinner } from "../../components/Spinner"
import { routes } from "../../routes"
import { Account } from "../accounts/Account"
import { Collections } from "./aspect.service"
import { EmptyCollections } from "./EmptyCollections"
import { NftFigure } from "./NftFigure"
import { NftItem } from "./NftItem"
import { useCollections } from "./useCollections"
import { useNfts } from "./useNfts"

interface AccountCollectionsProps {
  account: Account
  withHeader?: boolean
  customList?: Collections
  navigateToSend?: boolean
}

const Collections: FC<AccountCollectionsProps> = ({
  account,
  customList,
  navigateToSend = false,
}) => {
  const navigate = useNavigate()
  const collectibles = useCollections(account)

  return (
    <>
      {collectibles.length === 0 && (
        <EmptyCollections networkId={account.networkId} />
      )}

      {collectibles.length > 0 && (
        <SimpleGrid
          gridTemplateColumns="repeat(auto-fill, 158px)"
          gap="3"
          py={4}
          mx="4"
        >
          {(customList || collectibles).map((collectible) => (
            <NftFigure
              key={collectible.contractAddress}
              onClick={() =>
                navigate(routes.collectionNfts(collectible.contractAddress), {
                  state: { navigateToSend },
                })
              }
            >
              <NftItem
                name={collectible.name}
                thumbnailSrc={collectible.nfts[0].image_url_copy || ""}
                logoSrc={collectible.imageUri}
                total={collectible.nfts.length}
              />
            </NftFigure>
          ))}
        </SimpleGrid>
      )}
    </>
  )
}

const CollectionsFallback: FC<AccountCollectionsProps> = ({ account }) => {
  // this is needed to keep swr mounted so it can retry the request
  useNfts(account, {
    suspense: false,
    errorRetryInterval: 30e3 /* 30 seconds */,
  })

  return <ErrorBoundaryFallback title="Seems like Aspect API is down..." />
}

export const AccountCollections: FC<AccountCollectionsProps> = ({
  account,
  withHeader = true,
  customList,
  navigateToSend,
  ...rest
}) => {
  return (
    <>
      {withHeader && <H4 textAlign="center">NFTs</H4>}
      <Flex direction="column" flex={1} {...rest}>
        <ErrorBoundary fallback={<CollectionsFallback account={account} />}>
          <Suspense fallback={<Spinner size={64} style={{ marginTop: 40 }} />}>
            <Collections
              account={account}
              customList={customList}
              navigateToSend={navigateToSend}
            />
          </Suspense>
        </ErrorBoundary>
      </Flex>
    </>
  )
}
