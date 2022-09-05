import { FC } from "react"
import { Location, useLocation, useNavigate, useParams } from "react-router-dom"
import styled from "styled-components"

import Column from "../../components/Column"
import { IconBar } from "../../components/IconBar"
import Row from "../../components/Row"
import { Spinner } from "../../components/Spinner"
import { routes } from "../../routes"
import { H3 } from "../../theme/Typography"
import { useSelectedAccount } from "../accounts/accounts.state"
import { NftItem } from "./AccountCollections"
import { getNftPicture } from "./aspect.service"
import { useCollection } from "./useCollections"

const Container = styled(Column)`
  padding: 24px;
  gap: 16px;

  h3 {
    font-weight: 700;
    font-size: 28px;
    line-height: 34px;
    margin-bottom: 16px;
  }
`

interface LocationWithState extends Location {
  state: {
    navigateToSend?: boolean
  }
}

export const CollectionNfts: FC = () => {
  const { contractAddress } = useParams<{ contractAddress: string }>()
  const account = useSelectedAccount()
  const navigate = useNavigate()
  const { state } = useLocation() as LocationWithState

  const navigateToSend = state.navigateToSend || false

  const { collectible } = useCollection(contractAddress, account)

  if (!contractAddress) {
    return <></>
  }

  return (
    <>
      <IconBar back />
      <Container>
        <H3>{collectible?.name ?? "Loading..."}</H3>

        {collectible ? (
          <Row>
            {collectible.nfts.map((nft) => (
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
          </Row>
        ) : (
          <Spinner />
        )}
      </Container>
    </>
  )
}
