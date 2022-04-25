import { FC } from "react"
import { useParams } from "react-router-dom"
import styled from "styled-components"

import PlayOasisSvg from "../../assets/playoasis.svg"
import { BackButton } from "../components/BackButton"
import { Button } from "../components/Button"
import { Header } from "../components/Header"
import { useNfts } from "../hooks/useNfts"
import { useSelectedAccount } from "../states/account"
import { openPlayOasisNft } from "../utils/playoasis.service"

export const Container = styled.div`
  margin: 0 24px;

  h3 {
    font-weight: 700;
    font-size: 28px;
    line-height: 34px;
    margin-bottom: 16px;
  }

  img {
    width: 100%;
    border-radius: 8px;
  }

  a {
    color: white;
    font-size: 16px;
  }

  p {
    font-weight: 600;
    font-size: 15px;
    line-height: 20px;
    margin: 10px 0 15px 0;
  }

  ${Button} {
    display: flex;
    align-items: center;
    width: inherit;
    font-size: 13px;
    line-height: 18px;
    padding: 8px;

    svg {
      width: 24px;
    }

    span {
      margin: 0 5px;
    }
  }
`

export const NftScreen: FC = () => {
  const { contractAddress, tokenId } = useParams()
  const account = useSelectedAccount()

  const accountAddress = account?.address || ""
  const { nfts = [] } = useNfts(accountAddress)
  const nft = nfts.find(
    ({ contract_address, token_id }) =>
      contract_address === contractAddress && token_id === tokenId,
  )
  if (!account || !nft) {
    return <></>
  }

  return (
    <>
      <Header>
        <BackButton />
      </Header>
      <Container>
        <h3>{nft.name}</h3>
        <img src={nft.copy_image_url} alt={nft.name} />
        <p>{nft.description}</p>
        <Button
          onClick={() => openPlayOasisNft(nft.contract_address, nft.token_id)}
        >
          <PlayOasisSvg /> <span>View on PlayOasis</span>
        </Button>
      </Container>
    </>
  )
}
