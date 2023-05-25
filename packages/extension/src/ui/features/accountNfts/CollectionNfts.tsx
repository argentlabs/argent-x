import { BarBackButton, H3, H4, H6, NavigationContainer, P4 } from "@argent/ui"
import { Box, Flex, Image, SimpleGrid } from "@chakra-ui/react"
import { ethers } from "ethers"
import { get } from "lodash-es"
import React, { FC, useMemo } from "react"
import { Location, useLocation, useNavigate, useParams } from "react-router-dom"

import { Spinner } from "../../components/Spinner"
import { routes } from "../../routes"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { UnknownDappIcon } from "../actions/transaction/ApproveTransactionScreen/DappHeader/TransactionIcon/UnknownDappIcon"
import { getNftPicture } from "./aspect.service"
import { NftFallback } from "./NftFallback"
import { NftFigure } from "./NftFigure"
import { NftItem } from "./NftItem"
import { NftZodError, ParsedError, useCollection } from "./useCollections"

interface LocationWithState extends Location {
  state: {
    navigateToSend?: boolean
  }
}

export const CollectionNfts: FC = () => {
  const { contractAddress } = useParams<{ contractAddress: string }>()
  const account = useView(selectedAccountView)
  const navigate = useNavigate()
  const { state } = useLocation() as LocationWithState

  const navigateToSend = state?.navigateToSend || false
  const { collectible, error } = useCollection(contractAddress, account)

  const errorMap: ParsedError | null = useMemo(() => {
    if (!error) {
      return null
    }
    try {
      const parsedError = (error && JSON.parse(error)) || []
      return parsedError.reduce((a: ParsedError[], e: NftZodError) => {
        return {
          ...a,
          [e.path[0]]: e.code,
        }
      }, {})
    } catch {
      // error is not a json
      return {
        message: error.message,
      }
    }
  }, [error])

  // if no collectibles or no contract address, display generic error
  if ((error && !collectible) || !contractAddress) {
    return (
      <NavigationContainer
        leftButton={
          <BarBackButton
            onClick={() => navigate(routes.accountCollections())}
          />
        }
      >
        <H3 mt="4" textAlign="center">
          Error loading nfts
        </H3>
        <Flex position="relative">
          <NftFallback />
        </Flex>
      </NavigationContainer>
    )
  }

  if (errorMap?.message) {
    return (
      <NavigationContainer
        leftButton={
          <BarBackButton
            onClick={() => navigate(routes.accountCollections())}
          />
        }
      >
        <H3 mt="4" textAlign="center">
          {errorMap.message}
        </H3>
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
            {collectible.nfts.map((nft, index) => (
              <React.Fragment key={`${nft.contract_address}-${nft.token_id}`}>
                {!get(errorMap, index) && (
                  <NftFigure
                    onClick={() =>
                      navigate(
                        navigateToSend
                          ? routes.sendNft(nft.contract_address, nft.token_id)
                          : routes.accountNft(
                              nft.contract_address,
                              nft.token_id,
                            ),
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
                )}
                {errorMap && errorMap[index] && (
                  // eslint-disable-next-line @typescript-eslint/no-empty-function
                  <Box
                    w="160px"
                    h="192px"
                    position="relative"
                    as="figure"
                    bg="neutrals.800"
                    display="inline-block"
                    overflow="hidden"
                    borderRadius="lg"
                    p="2"
                  >
                    <NftItem
                      thumbnailSrc={""}
                      name={`${
                        nft.name ||
                        nft.contract.name_custom ||
                        nft.contract.name ||
                        "Untitled"
                      } not loaded`}
                    />
                  </Box>
                )}
              </React.Fragment>
            ))}
          </SimpleGrid>
        </>
      ) : (
        <Spinner />
      )}
    </NavigationContainer>
  )
}
