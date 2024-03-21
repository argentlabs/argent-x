import { NftItem, getNftPicture } from "@argent/x-shared"
import {
  BarCloseButton,
  Button,
  CellStack,
  H5,
  NavigationContainer,
  P4,
  icons,
} from "@argent/x-ui"
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  SimpleGrid,
} from "@chakra-ui/react"
import { FC } from "react"

import { TokenMenu } from "../accountTokens/TokenMenu"
import { NftImage } from "./NftImage"

const { SendIcon, ViewIcon } = icons

interface NftScreenProps {
  nft: NftItem
  onViewNft: () => void | Promise<void>
  onSendNft: () => void | Promise<void>
}

export const NftScreen: FC<NftScreenProps> = ({
  nft,
  onViewNft,
  onSendNft,
}) => {
  const description = nft.description
  const hasDescription = description?.length > 0
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

        {hasDescription && (
          <CellStack pb="18">
            <Accordion allowToggle>
              <AccordionItem>
                <AccordionButton justifyContent="space-between">
                  <P4 color="neutrals.300">Description</P4> <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>{nft.description}</AccordionPanel>
              </AccordionItem>
            </Accordion>
          </CellStack>
        )}

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
          <Button
            w="100%"
            size="sm"
            onClick={onViewNft}
            leftIcon={<ViewIcon />}
          >
            View
          </Button>
          <Button
            w="100%"
            size="sm"
            onClick={onSendNft}
            leftIcon={<SendIcon />}
          >
            Send
          </Button>
        </SimpleGrid>
      </NavigationContainer>
    </>
  )
}
