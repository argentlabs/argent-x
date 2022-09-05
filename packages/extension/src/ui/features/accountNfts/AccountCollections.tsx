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
import { useCollections } from "./useCollections"
import { useNfts } from "./useNfts"

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 16px;
  margin: 0 16px 0 16px;

  ${P} {
    text-align: center;
  }
`

const Header = styled.h2`
  font-weight: 600;
  font-size: 32px;
  line-height: 38.4px;
  margin-bottom: 25px;
  text-align: center;
`

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
    <div>
      {collectibles.length === 0 && (
        <>
          <P>No collectibles to show</P>
          {account.networkId === "goerli-alpha" && (
            <P style={{ marginTop: 120 }}>
              <small>
                You can browse collectibles on
                <A href="https://testnet.aspect.co" target="_blank">
                  Aspect
                </A>
              </small>
            </P>
          )}
          {account.networkId === "mainnet-alpha" && (
            <P style={{ marginTop: 120 }}>
              <small>
                You can browse collectibles on
                <A href="https://aspect.co" target="_blank">
                  Aspect
                </A>
              </small>
            </P>
          )}
          {account.networkId === "goerli-alpha" && (
            <P style={{ marginTop: 16 }}>
              <small>
                Or build your own 3D collectible on
                <A href="https://briq.construction/" target="_blank">
                  briq
                </A>
              </small>
            </P>
          )}
        </>
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
          <img src={collectible.imageUri} />
          <figcaption>
            {collectible.name}
            <CollectiblesNumber>{collectible.nfts.length}</CollectiblesNumber>
          </figcaption>
        </NftItem>
      ))}
    </div>
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
    <Container {...rest}>
      {withHeader && <Header>NFTs</Header>}
      <ErrorBoundary fallback={<CollectionsFallback account={account} />}>
        <Suspense fallback={<Spinner size={64} style={{ marginTop: 40 }} />}>
          <Collections
            account={account}
            customList={customList}
            navigateToSend={navigateToSend}
          />
        </Suspense>
      </ErrorBoundary>
    </Container>
  )
}
