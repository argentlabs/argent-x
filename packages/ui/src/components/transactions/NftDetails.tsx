import {
  generateAvatarImage,
  getColor,
  getNftPicture,
  prettifyCurrencyValue,
  prettifyTokenAmount,
  useAspectNft,
} from "@argent/shared"
import {
  AccordionButton,
  Flex,
  Image,
  Skeleton,
  SkeletonCircle,
} from "@chakra-ui/react"
import BigNumber from "bignumber.js"
import { FC, useMemo } from "react"

import { AlertIcon } from "../icons"
import { L2, P3, P4 } from "../Typography"

interface NftDetailsProps {
  contractAddress: string
  tokenId?: string
  networkId: string
  safe?: boolean
  dataIndex: number
  totalData: number
  isDisabled?: boolean
  isMainnet?: boolean
  amount: BigNumber
  usdValue?: BigNumber
}

export const NftDetails: FC<NftDetailsProps> = ({
  contractAddress,
  tokenId,
  networkId,
  safe,
  dataIndex,
  totalData,
  isDisabled,
  isMainnet,
  amount,
  usdValue,
}) => {
  const { data: fetchedNft, isValidating } = useAspectNft(
    contractAddress,
    tokenId,
    networkId,
  )

  const nft = useMemo(
    () => ({
      name: "Unknown NFT",
      description: "Unknown NFT",
      image_url_copy: generateAvatarImage("Unknown NFT", {
        background: getColor(contractAddress),
      }),
      ...fetchedNft,
    }),
    [contractAddress, fetchedNft],
  )

  const buttonDisabled = isDisabled || isValidating

  return (
    <AccordionButton
      display="flex"
      width="100%"
      justifyContent="space-between"
      outline="none"
      px="3"
      pb={dataIndex !== totalData - 1 || isValidating ? "3" : "3.5"}
      _expanded={{
        backgroundColor: "neutrals.700",
        pb: "3.5",
      }}
      disabled={buttonDisabled}
      _disabled={{
        cursor: "auto",
        opacity: 1,
      }}
      _hover={{
        backgroundColor: buttonDisabled ? "" : "neutrals.700",
        borderBottomRadius: dataIndex === totalData - 1 ? "xl" : "0",
      }}
    >
      {!isValidating ? (
        <>
          <Flex alignItems="center" gap="2">
            <Image
              src={getNftPicture({ image_url_copy: nft.image_url_copy })}
              w="5"
              h="5"
              borderRadius="base"
            />
            <P4 fontWeight="bold">{nft.name}</P4>
            {!safe && (
              <P3 color="error.500" fontWeight="bold" mt="0.25">
                <AlertIcon />
              </P3>
            )}
          </Flex>
          <Flex direction="column" gap="0.5" alignItems="flex-end">
            <P4
              color={amount.isNegative() ? "error.500" : "secondary.500"}
              fontWeight="bold"
            >
              {prettifyTokenAmount({
                amount: amount.toString(),
                decimals: 0,
                symbol: "NFT",
                showPlusSign: true,
              })}
            </P4>

            {isMainnet && !!usdValue && !usdValue.isZero() && (
              <L2 color="neutrals.300">
                {prettifyCurrencyValue(usdValue.abs().toString())}
              </L2>
            )}
          </Flex>
        </>
      ) : (
        <LoadingNftDetails />
      )}
    </AccordionButton>
  )
}

const LoadingNftDetails = (): JSX.Element => {
  return (
    <Flex gap="3" align="center" width="full">
      <SkeletonCircle
        size="6"
        borderRadius="full"
        startColor="neutrals.500"
        endColor="neutrals.700"
      />
      <Skeleton
        height="4"
        width="100%"
        startColor="neutrals.500"
        endColor="neutrals.700"
        borderRadius="100px"
        flex={1}
      />
    </Flex>
  )
}