import { P4 } from "@argent/ui"
import { Flex, Spinner, Box } from "@chakra-ui/react"

export function SwapTradeLoading() {
  return (
    <Box
      bg="neutrals.900"
      border="solid 1px"
      borderColor="neutrals.700"
      borderRadius="lg"
      boxShadow="menu"
      w="100%"
      mt="4"
      py="2"
      gap="3"
      data-testid="swap-trade-loading"
    >
      <Flex justifyContent="space-between" py="1.5" px="3">
        <P4 color="neutrals.300">Finding the best rate...</P4>
        <Spinner size="xs" />
      </Flex>
    </Box>
  )
}
