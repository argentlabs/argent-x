import { SwapPrimaryIcon } from "@argent/x-ui/icons"
import { H4 } from "@argent/x-ui"
import { Flex, Text } from "@chakra-ui/react"

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
        <SwapPrimaryIcon />
      </Text>
      <H4 mt="10" textAlign="center">
        Swaps are not available on this network
      </H4>
    </Flex>
  )
}
