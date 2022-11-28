import { Button, CellStack, H4, H6, P3, logos } from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { FC, Suspense } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { ErrorBoundary } from "../../components/ErrorBoundary"
import { ErrorBoundaryFallback } from "../../components/ErrorBoundaryFallback"
import { RowCentered } from "../../components/Row"
import { Spinner } from "../../components/Spinner"
import { routes } from "../../routes"
import { A, P } from "../../theme/Typography"
import { Account } from "../accounts/Account"
import { Collections } from "./aspect.service"
import { EmptyCollections } from "./EmptyCollections"
import { NftThumbnailImage } from "./NftThumbnailImage"
import { useCollections } from "./useCollections"
import { useNfts } from "./useNfts"

export const NftItem = styled.figure`
  display: inline-block;
  overflow: hidden;
  margin: 8px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.15);
  cursor: pointer;
  position: relative;

  img {
    width: 148px;
    height: 148px;
    object-fit: cover;
  }

  figcaption {
    ${({ theme }) => theme.flexRowNoWrap}
    justify-content: space-between;
    width: 148px;
    font-weight: 600;
    font-size: 15px;
    line-height: 20px;
    padding: 2px 10px 5px 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  transition: all 0.2s ease-in-out;
  &:hover {
    transform: scale(1.05);
  }
`

const CollectiblesNumber = styled(RowCentered)`
  background-color: ${({ theme }) => theme.bg1};
  height: 24px;
  width: 24px;
  border-radius: 50%;
  color: ${({ theme }) => theme.white};

  font-size: 13px;
  font-weight: 600;
  line-height: 18px;
`
const { Aspect, Briq, Mintsquare } = logos
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
      {(customList || collectibles).map((collectible) => (
        <NftItem
          key={collectible.contractAddress}
          onClick={() =>
            navigate(routes.collectionNfts(collectible.contractAddress), {
              state: { navigateToSend },
            })
          }
        >
          <NftThumbnailImage src={collectible.imageUri} />
          <figcaption>
            {collectible.name}
            <CollectiblesNumber>{collectible.nfts.length}</CollectiblesNumber>
          </figcaption>
        </NftItem>
      ))}
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
      <Flex
        direction="column"
        flex={1}
        mx="4"
        textAlign="center"
        justifyContent="center"
        {...rest}
      >
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
