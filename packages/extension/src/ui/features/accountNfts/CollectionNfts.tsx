import { BarBackButton, H4, NavigationContainer, P4 } from "@argent/ui"
import { Flex, Image, SimpleGrid } from "@chakra-ui/react"
import { ethers } from "ethers"
import { FC } from "react"
import { Location, useLocation, useNavigate, useParams } from "react-router-dom"

import { Spinner } from "../../components/Spinner"
import { routes } from "../../routes"
import { useSelectedAccount } from "../accounts/accounts.state"
import { getNftPicture } from "./aspect.service"
import { NftFigure } from "./NftFigure"
import { NftItem } from "./NftItem"
import { useCollection } from "./useCollections"

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

  const navigateToSend = state?.navigateToSend || false

  const { collectible, error } = useCollection(contractAddress, account)

  if (!contractAddress) {
    return <></>
  }

  if (error) {
    return <h1>Error loading</h1>
  }

  return (
    <NavigationContainer
      leftButton={
        <BarBackButton onClick={() => navigate(routes.accountCollections())} />
      }
    >
      {collectible ? (
        <>
          <Flex
            gap="2"
            justifyContent="center"
            direction="column"
            alignItems="center"
          >
            <Image
              w="64px"
              h="64px"
              src={collectible.imageUri}
              borderRadius="lg"
            />
            <H4>{collectible?.name || "Loading..."}</H4>
            <P4 color="neutrals.300">
              Floor price:{" "}
              {collectible.floorPrice
                ? ethers.utils.formatEther(collectible.floorPrice)
                : "-"}
            </P4>
          </Flex>
          <SimpleGrid
            gridTemplateColumns="repeat(auto-fill, 158px)"
            gap="3"
            mx="4"
            py={6}
          >
            {collectible.nfts.map((nft) => (
              <NftFigure
                key={`${nft.contract_address}-${nft.token_id}`}
                onClick={() =>
                  navigate(
                    navigateToSend
                      ? routes.sendNft(nft.contract_address, nft.token_id)
                      : routes.accountNft(nft.contract_address, nft.token_id),
                  )
                }
              >
                <NftItem
                  thumbnailSrc={getNftPicture(nft) || ""}
                  name={
                    nft.name ||
                    nft.contract.name_custom ||
                    nft.contract.name ||
                    "Untitled"
                  }
                />
              </NftFigure>
            ))}
          </SimpleGrid>
        </>
      ) : (
        <Spinner />
      )}
    </NavigationContainer>
  )
}
