import { buttonHoverStyle, H5, icons, ImageOptimized } from "@argent/x-ui"
import { Box, Center, Image } from "@chakra-ui/react"
import type { FC } from "react"

const { NoImageSecondaryIcon } = icons

interface NftItemProps {
  name: string
  thumbnailSrc?: string
  logoSrc?: string | null
  total?: number
}

const FallbackImage = () => (
  <Center w="full" aspectRatio="1/1" borderRadius="lg" bgColor="black.30">
    <NoImageSecondaryIcon color="text-secondary" fontSize="2xl" />
  </Center>
)

const NftItem: FC<NftItemProps> = ({ logoSrc, name, thumbnailSrc, total }) => (
  <Box as="figure" role="group">
    <Box
      position="relative"
      transitionProperty="common"
      transitionDuration="fast"
      _groupHover={{
        transform: "scale(1.05)",
      }}
    >
      {thumbnailSrc ? (
        <ImageOptimized
          src={thumbnailSrc}
          w="full"
          aspectRatio="1/1"
          rounded="lg"
          objectFit="contain"
          format="png"
          fallbackStrategy="onError"
          fallback={
            <Image
              src={thumbnailSrc}
              w="full"
              aspectRatio="1/1"
              rounded="lg"
              objectFit="contain"
              fallback={<FallbackImage />}
            />
          }
        />
      ) : (
        <FallbackImage />
      )}
      {logoSrc && (
        <Box
          bg="surface-elevated"
          position="absolute"
          p="1"
          w="12"
          h="12"
          bottom="-1"
          left="-1"
          borderRadius="xl"
          _groupHover={{
            boxShadow: buttonHoverStyle.boxShadow,
          }}
        >
          <ImageOptimized
            src={logoSrc}
            format="png"
            borderRadius="lg"
            fallbackStrategy="onError"
            fallback={<FallbackImage />}
          />
        </Box>
      )}
    </Box>

    <Box
      data-testid="nft-item-name"
      as="figcaption"
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      pt="3"
    >
      <H5 textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap">
        {name}
      </H5>
      {total !== undefined && <H5 color="text-secondary">{total}</H5>}
    </Box>
  </Box>
)

export { NftItem }
