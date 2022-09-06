import { FC, lazy } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import styled from "styled-components"
import { Schema, object } from "yup"

import { Button, ButtonGroup } from "../../components/Button"
import { ColumnCenter } from "../../components/Column"
import { IconBar } from "../../components/IconBar"
import { AspectLogo } from "../../components/Icons/AspectLogo"
import { MintSquareLogo } from "../../components/Icons/MintSquareLogo"
import { RowCentered } from "../../components/Row"
import { routes } from "../../routes"
import { addressSchema, isEqualAddress } from "../../services/addresses"
import { H3 } from "../../theme/Typography"
import { useSelectedAccount } from "../accounts/accounts.state"
import { TokenMenu } from "../accountTokens/TokenMenu"
import { openAspectNft } from "./aspect.service"
import { openMintSquareNft } from "./mint-square.service"
import { NftThumbnailImage } from "./NftThumbnailImage"
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
    color: ${({ theme }) => theme.text1};
    font-size: 16px;
  }

  p {
    font-weight: 600;
    font-size: 15px;
    line-height: 20px;
    margin: 10px 0 15px 0;
  }

  ${ButtonGroup} {
    margin-top: 10px;
  }
`

const NftDescription = styled.div`
  margin: 16px 0 20px;
  font-weight: 600;
  font-size: 15px;
  line-height: 20px;
`

const ViewOnText = styled.div`
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
`

const ViewOnButton = styled(Button)`
  padding: 10px;
`

export interface SendNftInput {
  recipient: string
}
export const SendNftSchema: Schema<SendNftInput> = object().required().shape({
  recipient: addressSchema,
})

export const NftScreen: FC = () => {
  const navigate = useNavigate()
  const { contractAddress, tokenId } = useParams()
  const account = useSelectedAccount()

  const { nfts = [] } = useNfts(account)
  const nft = nfts
    .filter(Boolean)
    .find(
      ({ contract_address, token_id }) =>
        contractAddress &&
        isEqualAddress(contract_address, contractAddress) &&
        token_id === tokenId,
    )

  if (!account || !contractAddress || !tokenId) {
    return <Navigate to={routes.accounts()} />
  }

  return (
    <>
      {nft ? (
        <IconBar
          back
          childAfter={<TokenMenu tokenAddress={nft.contract_address} />}
        >
          <H3>
            {nft.name ||
              nft.contract.name_custom ||
              nft.contract.name ||
              "Untitled"}
          </H3>
        </IconBar>
      ) : (
        <IconBar back>
          <H3>Not found</H3>
        </IconBar>
      )}
      <Container>
        {nft ? (
          <>
            {nft.animation_uri ? (
              <LazyNftModelViewer nft={nft} />
            ) : (
              <NftThumbnailImage src={nft.image_url_copy} alt={nft.name} />
            )}
            <NftDescription>{nft.description}</NftDescription>
          </>
        ) : null}

        <ColumnCenter gap="20px" style={{ marginBottom: "32px" }}>
          <RowCentered gap="8px">
            <ViewOnButton
              onClick={() =>
                openAspectNft(contractAddress, tokenId, account.networkId)
              }
            >
              <RowCentered gap="5px">
                <AspectLogo />
                <ViewOnText>View on Aspect</ViewOnText>
              </RowCentered>
            </ViewOnButton>

            <ViewOnButton
              onClick={() =>
                openMintSquareNft(contractAddress, tokenId, account.networkId)
              }
            >
              <RowCentered gap="5px">
                <MintSquareLogo />
                <ViewOnText>View on Mint Square</ViewOnText>
              </RowCentered>
            </ViewOnButton>
          </RowCentered>

          <Button
            type="button"
            onClick={() => navigate(routes.sendNft(contractAddress, tokenId))}
          >
            Send
          </Button>
        </ColumnCenter>
      </Container>
    </>
  )
}
