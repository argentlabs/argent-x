import { H5, icons } from "@argent/x-ui"
import { Flex, Text } from "@chakra-ui/react"
const { SwapIcon } = icons

export function NoSwap() {
  return (
    <Flex
      direction="column"
      justifyContent="center"
      alignItems="center"
      color="neutrals.500"
      flex="1"
      mx="14"
    >
      <Text fontSize="40">
        <SwapIcon />
      </Text>
      <H5 mt="10" textAlign="center">
        Swaps are not available on this network
      </H5>
    </Flex>
  )
}
