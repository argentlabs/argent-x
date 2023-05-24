import { L2, P3, P4, TextWithAmount, icons } from "@argent/ui"
import {
  AccordionButton,
  Flex,
  Image,
  Skeleton,
  SkeletonCircle,
} from "@chakra-ui/react"
import BigNumber from "bignumber.js"
import { FC, useCallback, useMemo } from "react"

import { generateAvatarImage } from "../../../../../../shared/avatarImage"
import {
  prettifyCurrencyValue,
  prettifyTokenAmount,
} from "../../../../../../shared/token/price"
import {
  getNftPicture,
  useAspectCollection,
  useAspectNft,
} from "../../../../accountNfts/aspect.service"
import { getColor } from "../../../../accounts/accounts.service"

const { AlertIcon } = icons

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
  const { data: fetchedNft, isValidating: isNftLoading } = useAspectNft(
    contractAddress,
    tokenId,
    networkId,
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
    },
  )

  const { data: fetchedCollection, isValidating: isCollectionLoading } =
    useAspectCollection(contractAddress, networkId)

  const unknownNftAvatar = useCallback(
    (contractAddress: string, nameOrSymbol?: string | null) => {
      return generateAvatarImage(nameOrSymbol ?? "Unknown NFT", {
        background: getColor(contractAddress),
      })
    },
    [],
  )

  const nft = useMemo(() => {
    if (fetchedNft && fetchedNft.name) {
      return {
        name: fetchedNft.name,
        description: fetchedNft.description,
        image_url_copy:
          fetchedNft.image_url_copy ??
          fetchedNft.image_uri ??
          unknownNftAvatar(contractAddress, fetchedNft.name),
      }
    }

    if (fetchedCollection) {
      return {
        name: `${fetchedCollection.name} NFT`,
        description: `${fetchedCollection.name} NFT`,
        image_url_copy:
          fetchedCollection.image_url ??
          unknownNftAvatar(contractAddress, fetchedCollection.symbol),
      }
    }

    return {
      name: "Unknown NFT",
      description: "Unknown NFT",
      image_url_copy: unknownNftAvatar(contractAddress),
    }
  }, [contractAddress, fetchedCollection, fetchedNft, unknownNftAvatar])

  const isValidating = isNftLoading || isCollectionLoading

  const isLoading = !nft && isValidating

  const buttonDisabled = isDisabled || isLoading

  return (
    <AccordionButton
      display="flex"
      width="100%"
      justifyContent="space-between"
      outline="none"
      px="3"
      pb={dataIndex !== totalData - 1 || isLoading ? "3" : "3.5"}
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
      {!isLoading ? (
        <>
          <Flex alignItems="center" gap="2">
            <Image src={getNftPicture(nft)} w="5" h="5" borderRadius="base" />
            <P4 fontWeight="bold">{nft.name}</P4>
            {!safe && (
              <P3 color="error.500" fontWeight="bold" mt="0.25">
                <AlertIcon />
              </P3>
            )}
          </Flex>
          <Flex direction="column" gap="0.5" alignItems="flex-end">
            <TextWithAmount amount={amount.toFixed()}>
              <P4
                color={amount.isNegative() ? "error.500" : "secondary.500"}
                fontWeight="bold"
              >
                {prettifyTokenAmount({
                  amount: amount.toFixed(),
                  decimals: 0,
                  symbol: "NFT",
                  showPlusSign: true,
                })}
              </P4>
            </TextWithAmount>

            {/** 0 usdValue means we don't have any value */}
            {isMainnet && !!usdValue && !usdValue.isZero() && (
              <L2 color="neutrals.300">
                {prettifyCurrencyValue(usdValue.abs().toFixed())}
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
