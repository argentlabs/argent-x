import { BigNumber } from "ethers"
import { FC, lazy, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import styled from "styled-components"

import { useAppState } from "../../app.state"
import { BackButton } from "../../components/BackButton"
import { Button, ButtonGroup } from "../../components/Button"
import { Header } from "../../components/Header"
import { InputText } from "../../components/InputText"
import { routes } from "../../routes"
import { isValidAddress } from "../../utils/addresses"
import {
  getUint256CalldataFromBN,
  sendTransaction,
} from "../../utils/transactions"
import { useSelectedAccount } from "../accounts/accounts.state"
import { openPlayOasisNft } from "./playoasis.service"
import PlayOasisSvg from "./playoasis.svg"
import { useNfts } from "./useNfts"

const LazyNftModelViewer = lazy(() => import("./NftModelViewer"))

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

  .play-oasis {
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

  ${ButtonGroup} {
    margin-top: 10px;
  }
`

export const NftScreen: FC = () => {
  const navigate = useNavigate()
  const { contractAddress, tokenId } = useParams()
  const account = useSelectedAccount()
  const [recipient, setRecipient] = useState("")

  const accountAddress = account?.address || ""
  const { nfts = [] } = useNfts(accountAddress)
  const nft = nfts.find(
    ({ contract_address, token_id }) =>
      contract_address === contractAddress && token_id === tokenId,
  )
  if (!account || !nft || !contractAddress || !tokenId) {
    return <></>
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const to = recipient?.trim()
    if (!isValidAddress(to)) {
      useAppState.setState({ error: `Invalid recipient address: ${to}` })
      navigate(routes.error())
    }

    sendTransaction({
      to: contractAddress,
      method: "transferFrom",
      calldata: {
        from_: accountAddress,
        to,
        tokenId: getUint256CalldataFromBN(BigNumber.from(tokenId)),
      },
    })

    navigate(routes.accountActivity())
  }

  return (
    <>
      <Header>
        <BackButton />
      </Header>
      <Container>
        <h3>{nft.name}</h3>
        {nft.animation_url ? (
          <LazyNftModelViewer nft={nft} />
        ) : (
          <img src={nft.copy_image_url} alt={nft.name} />
        )}
        <p>{nft.description}</p>
        <Button
          className="play-oasis"
          onClick={() => openPlayOasisNft(nft.contract_address, nft.token_id)}
        >
          <PlayOasisSvg /> <span>View on PlayOasis</span>
        </Button>

        <ButtonGroup as="form" onSubmit={handleSubmit}>
          <InputText
            placeholder="Recipient"
            value={recipient}
            onChange={(e: any) => setRecipient(e.target.value)}
          />
          <Button type="submit">Send</Button>
        </ButtonGroup>
      </Container>
    </>
  )
}
