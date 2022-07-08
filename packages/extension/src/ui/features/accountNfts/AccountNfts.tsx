import { FC, Suspense } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { ErrorBoundary } from "../../components/ErrorBoundary"
import { ErrorBoundaryFallback } from "../../components/ErrorBoundaryFallback"
import { Spinner } from "../../components/Spinner"
import { A, P } from "../../components/Typography"
import { routes } from "../../routes"
import { Account } from "../accounts/Account"
import { AspectNft } from "./aspect.model"
import { getNftPicture } from "./aspect.service"
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

const NftItem = styled.figure`
  display: inline-block;
  overflow: hidden;
  margin: 8px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.15);
  cursor: pointer;

  img {
    width: 148px;
    height: 148px;
    object-fit: cover;
  }

  figcaption {
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

interface AccountNftsProps {
  account: Account
  withHeader?: boolean
  customList?: AspectNft[]
  navigateToSend?: boolean
}

// FIXME: as soon as aspect is on mainnet this needs to be network aware
const Nfts: FC<AccountNftsProps> = ({
  account,
  customList,
  navigateToSend = false,
}) => {
  const navigate = useNavigate()
  const { nfts = [] } = useNfts(account)

  return (
    <div>
      {nfts.length === 0 && (
        <>
          <P>No collectibles to show</P>
          <P style={{ marginTop: 120 }}>
            <small>
              You can browse collectibles on
              <A href="https://testnet.aspect.co" target="_blank">
                Aspect
              </A>
            </small>
          </P>
          <P style={{ marginTop: 16 }}>
            <small>
              Or build your own 3D collectible on
              <A href="https://briq.construction/" target="_blank">
                briq
              </A>
            </small>
          </P>
        </>
      )}
      {(customList || nfts).map((nft) => (
        <NftItem
          key={`${nft.contract_address}-${nft.token_id}`}
          onClick={() =>
            navigate(
              navigateToSend
                ? routes.sendNft(nft.contract_address, nft.token_id)
                : routes.accountNft(nft.contract_address, nft.token_id),
            )
          }
        >
          <img src={getNftPicture(nft)} />
          <figcaption>{nft.name}</figcaption>
        </NftItem>
      ))}
    </div>
  )
}

const NftsFallback: FC<AccountNftsProps> = ({ account }) => {
  // this is needed to keep swr mounted so it can retry the request
  useNfts(account, {
    suspense: false,
    errorRetryInterval: 30e3 /* 30 seconds */,
  })

  return <ErrorBoundaryFallback title="Seems like Aspect API is down..." />
}

export const AccountNfts: FC<AccountNftsProps> = ({
  account,
  withHeader = true,
  customList,
  navigateToSend,
  ...rest
}) => {
  return (
    <Container {...rest}>
      {withHeader && <Header>Collectibles</Header>}
      <ErrorBoundary fallback={<NftsFallback account={account} />}>
        <Suspense fallback={<Spinner size={64} style={{ marginTop: 40 }} />}>
          <Nfts
            account={account}
            customList={customList}
            navigateToSend={navigateToSend}
          />
        </Suspense>
      </ErrorBoundary>
    </Container>
  )
}
