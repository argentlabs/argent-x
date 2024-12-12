import { P3 } from "@argent/x-ui"
import { Flex, Spinner, Box } from "@chakra-ui/react"

export function SwapTradeLoading() {
  return (
    <Box
      bg="surface-default"
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
        <P3 color="neutrals.300">Finding the best rate...</P3>
        <Spinner size="xs" />
      </Flex>
    </Box>
  )
}
