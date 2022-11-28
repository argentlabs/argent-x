import {
  BarBackButton,
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
  Flex,
  Image,
  SimpleGrid,
} from "@chakra-ui/react"
import { ethers } from "ethers"
import { FC, lazy } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import { Schema, object } from "yup"

import { routes } from "../../routes"
import { addressSchema, isEqualAddress } from "../../services/addresses"
import { useSelectedAccount } from "../accounts/accounts.state"
import { TokenMenu } from "../accountTokens/TokenMenu"
import { openAspectNft } from "./aspect.service"
import { openMintSquareNft } from "./mint-square.service"
import { useNfts } from "./useNfts"
import { ViewOnMenu } from "./ViewOnMenu"

const LazyNftModelViewer = lazy(() => import("./NftModelViewer"))

const { SendIcon, DropdownDownIcon } = icons

export interface SendNftInput {
  recipient: string
}
export const SendNftSchema: Schema<SendNftInput> = object().required().shape({
  recipient: addressSchema,
})

export const NftScreen: FC = () => {
  const navigate = useNavigate()
  const { contractAddress, tokenId } = useParams()
  const account = useSelectedAccount()

  const { nfts = [] } = useNfts(account)
  const nft = nfts
    .filter(Boolean)
    .find(
      ({ contract_address, token_id }) =>
        contractAddress &&
        isEqualAddress(contract_address, contractAddress) &&
        token_id === tokenId,
    )

  if (!account || !contractAddress || !tokenId) {
    return <Navigate to={routes.accounts()} />
  }

  if (!nft) {
    return (
      <NavigationContainer
        leftButton={
          <BarBackButton
            onClick={() => navigate(routes.accountCollections())}
          />
        }
        title="Not found"
      />
    )
  }

  return (
    <>
      <NavigationContainer
        leftButton={
          <TokenMenu tokenAddress={nft.contract_address} canHideToken={false} />
        }
        rightButton={<BarCloseButton onClick={() => navigate(-1)} />}
      >
        <>
          {nft.animation_uri ? (
            <LazyNftModelViewer nft={nft} />
          ) : (
            <Box mx="10">
              <Image
                border="solid 2px"
                borderColor="transparent"
                borderRadius="lg"
                alt={nft.name}
                src={nft.image_url_copy}
              />
            </Box>
          )}
          <H5 py="6" textAlign="center">
            {nft.name}
          </H5>
        </>

        <CellStack pb="18">
          <Accordion allowToggle>
            <AccordionItem>
              <AccordionButton justifyContent="space-between">
                <P4 color="neutrals.300">Description</P4> <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>{nft.description}</AccordionPanel>
            </AccordionItem>
          </Accordion>

          <Flex
            justifyContent="space-between"
            alignItems="center"
            px="4"
            py="2"
            border="solid 1px"
            borderColor="neutrals.700"
            borderRadius="lg"
          >
            <P4 color="neutrals.300">Best Offer</P4>
            <P4>
              {ethers.utils.formatEther(nft.best_bid_order?.payment_amount) ||
                "0"}
              ETH
            </P4>
          </Flex>
        </CellStack>
        {/*  <ColumnCenter gap="20px" style={{ marginBottom: "32px" }}>
          <RowCentered gap="8px">
            <ViewOnButton
              onClick={() =>
                openAspectNft(contractAddress, tokenId, account.networkId)
              }
            >
              <RowCentered gap="5px">
                <AspectLogo />
                <ViewOnText>View on Aspect</ViewOnText>
              </RowCentered>
            </ViewOnButton>

            <ViewOnButton
              onClick={() =>
                openMintSquareNft(contractAddress, tokenId, account.networkId)
              }
            >
              <RowCentered gap="5px">
                <MintSquareLogo />
                <ViewOnText>View on Mint Square</ViewOnText>
              </RowCentered>
            </ViewOnButton>
          </RowCentered>
 */}
        {/* </ColumnCenter> */}
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
            networkId={account.networkId}
          />
          <Button
            w="100%"
            type="button"
            onClick={() => navigate(routes.sendNft(contractAddress, tokenId))}
            leftIcon={<SendIcon />}
          >
            Send
          </Button>
        </SimpleGrid>
      </NavigationContainer>
    </>
  )
}
