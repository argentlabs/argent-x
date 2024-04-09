import { icons } from "@argent/x-ui"
import { Box, Text } from "@chakra-ui/react"

const { ImageIcon } = icons

const NftFallback = () => (
  <Box height={0} width="100%" position="relative" pb="100%">
    <Box
      position="absolute"
      top={0}
      bottom={0}
      left={0}
      right={0}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Text fontSize="5xl" color="neutrals.500">
        <ImageIcon />
      </Text>
    </Box>
  </Box>
)

export { NftFallback }
