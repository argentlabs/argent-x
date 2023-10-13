import {
  Collection,
  NftItem,
  bigDecimal,
  generateAvatarImage,
  getColor,
  getNftPicture,
  prettifyCurrencyValue,
  prettifyTokenAmount,
} from "@argent/shared"
import { AccordionButton, Flex, Image, useColorMode } from "@chakra-ui/react"
import { FC, useCallback, useMemo } from "react"

import { TextWithAmount } from ".."
import { L2, P3, P4 } from "../Typography"
import { AlertIcon } from "../icons"

const UNKNOWN_NFT = "Unknown NFT"

interface NftDetailsProps {
  contractAddress: string
  tokenId?: string
  networkId: string
  safe?: boolean
  dataIndex: number
  totalData: number
  isDisabled?: boolean
  isDefaultNetwork?: boolean
  amount: bigint
  usdValue?: string
  nft?: NftItem
  collection?: Collection
}

export const NftDetails: FC<NftDetailsProps> = ({
  contractAddress,
  safe,
  dataIndex,
  totalData,
  isDisabled,
  isDefaultNetwork,
  amount,
  usdValue,
  nft,
  collection,
}) => {
  const { colorMode } = useColorMode()
  const isDark = useMemo(() => colorMode === "dark", [colorMode])

  const unknownNftAvatar = useCallback(
    (contractAddress: string, nameOrSymbol?: string | null) => {
      return generateAvatarImage(nameOrSymbol ?? UNKNOWN_NFT, {
        background: getColor(contractAddress),
      })
    },
    [],
  )

  const nftToDisplay = useMemo(() => {
    if (nft && nft.name) {
      return {
        name: nft.name,
        description: nft.description,
        image_url_copy:
          nft.image_url_copy ??
          nft.image_uri ??
          unknownNftAvatar(contractAddress, nft.name),
      }
    }

    if (collection) {
      const name = collection.name ?? "Unknown Collection"

      return {
        name: `${name} NFT`,
        description: `${name} NFT`,
        image_url_copy:
          collection.imageUri ?? unknownNftAvatar(contractAddress),
      }
    }

    return {
      name: UNKNOWN_NFT,
      description: UNKNOWN_NFT,
      image_url_copy: unknownNftAvatar(contractAddress),
    }
  }, [contractAddress, collection, nft, unknownNftAvatar])

  return (
    <AccordionButton
      display="flex"
      width="100%"
      justifyContent="space-between"
      outline="none"
      px="3"
      pb={dataIndex !== totalData - 1 ? "3" : "3.5"}
      _expanded={{
        backgroundColor: isDark ? "neutrals.700" : "gray.50",
        pb: "3.5",
      }}
      disabled={isDisabled}
      _disabled={{
        cursor: "auto",
        opacity: 1,
      }}
      _hover={{
        backgroundColor: isDisabled ? "" : isDark ? "neutrals.700" : "gray.50",
        borderBottomRadius: dataIndex === totalData - 1 ? "xl" : "0",
      }}
    >
      <Flex alignItems="center" gap="2">
        <Image
          src={
            getNftPicture({ image_url_copy: nftToDisplay.image_url_copy }) || ""
          }
          w="5"
          h="5"
          borderRadius="base"
        />
        <P4 fontWeight="bold" color="text">
          {nftToDisplay.name}
        </P4>
        {!safe && (
          <P3 color="error.500" fontWeight="bold" mt="0.25">
            <AlertIcon />
          </P3>
        )}
      </Flex>
      <Flex direction="column" gap="0.5" alignItems="flex-end">
        <TextWithAmount amount={amount}>
          <P4
            color={amount < 0n ? "error.500" : "secondary.500"}
            fontWeight="bold"
          >
            {prettifyTokenAmount({
              amount: amount,
              decimals: 0,
              symbol: "NFT",
              showPlusSign: true,
            })}
          </P4>
        </TextWithAmount>
        {isDefaultNetwork && !!usdValue && usdValue !== "0" && (
          <L2 color="neutrals.300">
            {prettifyCurrencyValue(
              bigDecimal.parseCurrencyAbs(usdValue).toString(),
            )}
          </L2>
        )}
      </Flex>
    </AccordionButton>
  )
}
