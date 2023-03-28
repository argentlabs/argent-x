import { P4 } from "@argent/ui"
import { Center, Spinner } from "@chakra-ui/react"

export const SimulationLoadingBanner = () => {
  return (
    <Center bg="neutrals.800" py="4" boxShadow="menu" borderRadius="xl" gap="2">
      <Spinner size="sm" background="whiteAlpha.50" />
      <P4 fontWeight="bold" color="neutrals.300">
        Simulating transaction...
      </P4>
    </Center>
  )
}
