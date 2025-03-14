import { WarningCirclePrimaryIcon } from "@argent/x-ui/icons"
import { H3 } from "@argent/x-ui"
import { Center, VStack } from "@chakra-ui/react"

export const ImportLedgerAccountsError = () => {
  return (
    <Center height="full">
      <VStack spacing="8">
        <WarningCirclePrimaryIcon color="primary.500" h={12} w={12} />
        <H3 color="white">Something went wrong...</H3>
      </VStack>
    </Center>
  )
}
