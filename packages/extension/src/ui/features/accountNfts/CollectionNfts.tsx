import { BarBackButton, H1, H4, H6, NavigationContainer, P4 } from "@argent/ui"
import { Flex, Image, SimpleGrid } from "@chakra-ui/react"
import { formatEther } from "ethers"
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
    return (
      <NavigationContainer
        leftButton={
          <BarBackButton
            onClick={() => navigate(routes.accountCollections())}
          />
        }
      >
        <H1 mt="4" textAlign="center">
          Error loading
        </H1>
      </NavigationContainer>
    )
  }

  return (
    <NavigationContainer
      leftButton={
        <BarBackButton onClick={() => navigate(routes.accountCollections())} />
      }
      scrollContent={
        <>
          <Image
            w="28px"
            h="28px"
            src={collectible?.imageUri}
            borderRadius="lg"
          />
          <H6>{collectible?.name}</H6>
        </>
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
              backgroundColor={
                !collectible.imageUri ? "neutrals.300" : "transparent"
              }
              borderRadius="lg"
            />
            <H4>{collectible?.name || "Loading..."}</H4>
            <P4 color="neutrals.300">
              Floor price:{" "}
              {collectible.floorPrice ? (
                <>{formatEther(collectible.floorPrice)} ETH</>
              ) : (
                "-"
              )}
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
