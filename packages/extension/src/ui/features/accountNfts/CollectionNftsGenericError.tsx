import { BarBackButton, H3, NavigationContainer } from "@argent/x-ui"
import { Flex } from "@chakra-ui/react"
import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../../shared/ui/routes"
import { NftFallback } from "./NftFallback"

export const CollectionNftsGenericError: FC = () => {
  const navigate = useNavigate()

  return (
    <NavigationContainer
      leftButton={
        <BarBackButton onClick={() => navigate(routes.accountCollections())} />
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
