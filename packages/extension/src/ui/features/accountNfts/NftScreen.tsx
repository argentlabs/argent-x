import { Address, NftItem, bigDecimal, getNftPicture } from "@argent/shared"
import {
  B3,
  BarCloseButton,
  Button,
  CellStack,
  H5,
  NavigationContainer,
  P4,
  icons,
} from "@argent/ui"
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  SimpleGrid,
} from "@chakra-ui/react"
import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../routes"
import { TokenMenu } from "../accountTokens/TokenMenu"
import { NftImage } from "./NftImage"
import { ViewOnMenu } from "./ViewOnMenu"

const { SendIcon } = icons

interface NftScreenProps {
  contractAddress: Address
  networkId: string
  tokenId: string
  nft: NftItem
}

export const NftScreen: FC<NftScreenProps> = ({
  contractAddress,
  networkId,
  tokenId,
  nft,
}) => {
  const navigate = useNavigate()
  const onClick = useCallback(() => {
    navigate(
      routes.sendRecipientScreen({
        tokenAddress: contractAddress,
        tokenId,
      }),
    )
  }, [contractAddress, navigate, tokenId])
  return (
    <>
      <NavigationContainer
        isAbsolute
        leftButton={<BarCloseButton />}
        rightButton={
          <TokenMenu tokenAddress={nft.contract_address} canHideToken={false} />
        }
      >
        <>
          <Box
            pt="18"
            px="10"
            position="relative"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Box
              backgroundImage={getNftPicture(nft) || ""}
              backgroundPosition="center"
              backgroundSize="cover"
              backgroundRepeat="no-repeat"
              style={{ filter: "blur(150px)" }}
              position="absolute"
              top="20%"
              left="0"
              right="0"
              bottom="25%"
            />
            <NftImage nft={nft} />
          </Box>
          <H5 py="6" textAlign="center" mx={4}>
            {nft.name}
          </H5>
        </>

        <CellStack pb="18">
          <Accordion allowToggle>
            <AccordionItem>
              <AccordionButton justifyContent="space-between">
                <P4 color="neutrals.300">Description</P4> <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                {nft.description.length > 0
                  ? nft.description
                  : nft.collection?.description}
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </CellStack>
        <SimpleGrid
          bg="neutrals.900"
          position="fixed"
          bottom="0"
          left="0"
          right="0"
          px="4"
          py="3"
          gap="2"
          columns={2}
          borderTop="solid 1px"
          borderColor="neutrals.800"
        >
          <ViewOnMenu
            contractAddress={contractAddress}
            tokenId={tokenId}
            networkId={networkId}
          />
          <Button
            w="100%"
            type="button"
            onClick={onClick}
            leftIcon={<SendIcon />}
            bg="neutrals.700"
            _hover={{ bg: "neutrals.600" }}
          >
            <B3>Send</B3>
          </Button>
        </SimpleGrid>
      </NavigationContainer>
    </>
  )
}
