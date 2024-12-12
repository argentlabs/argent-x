import { BarBackButton, H2, NavigationContainer } from "@argent/x-ui"
import { Flex } from "@chakra-ui/react"
import type { FC } from "react"

import { NftFallback } from "./NftFallback"

interface CollectionNftsGenericErrorProps {
  onBack?: () => void
}

export const CollectionNftsGenericError: FC<
  CollectionNftsGenericErrorProps
> = ({ onBack }) => {
  return (
    <NavigationContainer
      leftButton={onBack ? <BarBackButton onClick={onBack} /> : undefined}
    >
      <H2 mt="4" textAlign="center">
        Error loading nfts
      </H2>
      <Flex position="relative">
        <NftFallback />
      </Flex>
    </NavigationContainer>
  )
}
