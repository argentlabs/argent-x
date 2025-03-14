import { NoImageSecondaryIcon } from "@argent/x-ui/icons"
import { Box, Text } from "@chakra-ui/react"

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
        <NoImageSecondaryIcon />
      </Text>
    </Box>
  </Box>
)

export { NftFallback }
