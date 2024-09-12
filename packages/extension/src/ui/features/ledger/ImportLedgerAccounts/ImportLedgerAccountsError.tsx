import { H4, iconsDeprecated } from "@argent/x-ui"
import { Center, VStack } from "@chakra-ui/react"

const { AlertFillIcon } = iconsDeprecated

export const ImportLedgerAccountsError = () => {
  return (
    <Center height="full">
      <VStack spacing="8">
        <AlertFillIcon color="primary.500" h={12} w={12} />
        <H4 color="white">Something went wrong...</H4>
      </VStack>
    </Center>
  )
}
