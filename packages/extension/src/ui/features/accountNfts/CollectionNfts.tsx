import { Collection, NftItem, bigDecimal, getNftPicture } from "@argent/shared"
import {
  BarBackButton,
  H4,
  H6,
  NavigationContainer,
  NavigationContainerProps,
  P4,
} from "@argent/ui"
import { Flex, Image, SimpleGrid } from "@chakra-ui/react"
import React, { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { Spinner } from "../../components/Spinner"
import { routes } from "../../routes"
import { UnknownDappIcon } from "../actions/transaction/ApproveTransactionScreen/DappHeader/TransactionIcon/UnknownDappIcon"
import { NftFigure } from "./NftFigure"
import { NftItem as NftItemComponent } from "./NftItem"

interface CollectionNftsProps extends NavigationContainerProps {
  nfts: NftItem[]
  collection?: Collection
  onNftClick?: (nft: NftItem) => void
}

export const CollectionNfts: FC<CollectionNftsProps> = ({
  nfts,
  collection,
  onNftClick,
  ...rest
}) => {
  const navigate = useNavigate()
  const onClick = useCallback(
    (nft: NftItem) => {
      if (onNftClick) {
        onNftClick(nft)
      } else {
        navigate(routes.accountNft(nft.contract_address, nft.token_id))
      }
    },
    [navigate, onNftClick],
  )
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
            src={collection?.imageUri ?? undefined}
            borderRadius="lg"
          />
          <H6>{collection?.name}</H6>
        </>
      }
      {...rest}
    >
      {collection ? (
        <>
          <Flex
            gap="2"
            justifyContent="center"
            direction="column"
            alignItems="center"
          >
            {collection.imageUri ? (
              <Image
                w={16}
                h={16}
                src={collection.imageUri}
                backgroundColor={"neutrals.300"}
                borderRadius="lg"
              />
            ) : (
              <UnknownDappIcon />
            )}
            <H4>{collection?.name || "Loading..."}</H4>
            {!!collection.floorPrice && (
              <P4 color="neutrals.300">
                Floor price: {bigDecimal.formatEther(collection.floorPrice)} ETH
              </P4>
            )}
          </Flex>
          <SimpleGrid
            gridTemplateColumns="repeat(auto-fill, minmax(155px, 1fr))"
            gap="3"
            mx="4"
            py={6}
          >
            {nfts.map((nft) => (
              <React.Fragment key={`${nft.contract_address}-${nft.token_id}`}>
                <NftFigure onClick={() => onClick(nft)}>
                  <NftItemComponent
                    thumbnailSrc={getNftPicture(nft) || ""}
                    name={nft.name || collection.name || "Untitled"}
                  />
                </NftFigure>
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
