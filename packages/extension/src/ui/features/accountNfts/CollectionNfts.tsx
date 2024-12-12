import type { Collection, NftItem } from "@argent/x-shared"
import { bigDecimal, getNftPicture } from "@argent/x-shared"
import type { NavigationContainerProps } from "@argent/x-ui"
import { BarBackButton, H3, H5, NavigationContainer, P3 } from "@argent/x-ui"
import { Flex, Image, SimpleGrid, Spinner } from "@chakra-ui/react"
import type { FC } from "react"
import React, { useCallback } from "react"

import { NftFigure } from "./NftFigure"
import { NftItem as NftItemComponent } from "./NftItem"
import { UnknownDappIcon } from "../actions/transactionV2/header/icon"
import { routes } from "../../../shared/ui/routes"
import { useNavigate } from "react-router-dom"
import { useCurrentPathnameWithQuery } from "../../hooks/useRoute"

interface CollectionNftsProps extends NavigationContainerProps {
  nfts: NftItem[]
  collection?: Collection
  onNftClick?: (nft: NftItem) => void
  onBack?: () => void
}

export const CollectionNfts: FC<CollectionNftsProps> = ({
  nfts,
  collection,
  onNftClick,
  onBack,
  ...rest
}) => {
  const returnTo = useCurrentPathnameWithQuery()
  const navigate = useNavigate()
  const onClick = useCallback(
    (nft: NftItem) => {
      if (onNftClick) {
        onNftClick(nft)
      } else {
        navigate(
          routes.accountNft(nft.contract_address, nft.token_id, returnTo),
        )
      }
    },
    [navigate, onNftClick, returnTo],
  )
  return (
    <NavigationContainer
      leftButton={onBack ? <BarBackButton onClick={onBack} /> : undefined}
      scrollContent={
        <>
          <Image
            w="28px"
            h="28px"
            src={collection?.imageUri ?? undefined}
            borderRadius="lg"
          />
          <H5>{collection?.name}</H5>
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
            <H3>{collection?.name || "Loading..."}</H3>
            {!!collection.floorPrice && (
              <P3 color="neutrals.300">
                Floor price: {bigDecimal.formatEther(collection.floorPrice)} ETH
              </P3>
            )}
          </Flex>
          <SimpleGrid
            gridTemplateColumns="repeat(auto-fill, minmax(10em, 1fr))"
            gap="2"
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
