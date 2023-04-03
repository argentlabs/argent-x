import { BarBackButton, H1, H4, H6, NavigationContainer, P4 } from "@argent/ui"
import { Flex, Image, SimpleGrid } from "@chakra-ui/react"
import { ethers } from "ethers"
import { FC } from "react"
import { Location, useLocation, useNavigate, useParams } from "react-router-dom"

import { Spinner } from "../../components/Spinner"
import { routes } from "../../routes"
import { useSelectedAccount } from "../accounts/accounts.state"
import { UnknownDappIcon } from "../actions/transaction/ApproveTransactionScreen/DappHeader/TransactionIcon/UnknownDappIcon"
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
            src={collectible?.imageUri ?? undefined}
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
            {collectible.imageUri ? (
              <Image
                w={16}
                h={16}
                src={collectible.imageUri}
                backgroundColor={"neutrals.300"}
                borderRadius="lg"
              />
            ) : (
              <UnknownDappIcon />
            )}
            <H4>{collectible?.name || "Loading..."}</H4>
            {collectible.floorPrice && (
              <P4 color="neutrals.300">
                Floor price: {ethers.utils.formatEther(collectible.floorPrice)}{" "}
                ETH
              </P4>
            )}
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
