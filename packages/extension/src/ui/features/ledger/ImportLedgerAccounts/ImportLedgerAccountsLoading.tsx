import { H4 } from "@argent/x-ui"
import { Center, Spinner, VStack } from "@chakra-ui/react"

export const ImportLedgerAccountsLoading = () => {
  return (
    <Center height="full">
      <VStack spacing="8">
        <Spinner color="white" size="lg" />
        <H4 color="white">Detecting accounts...</H4>
      </VStack>
    </Center>
  )
}
