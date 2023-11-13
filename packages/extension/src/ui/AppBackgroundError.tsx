import { Center, Flex } from "@chakra-ui/react"
import { FC } from "react"

import { H4, P3 } from "@argent/ui"
import { SupportFooter } from "./features/settings/SupportFooter"

export const AppBackgroundError: FC = () => {
  return (
    <Flex direction="column" flex={1} p={4}>
      <Center flex={1} flexDirection={"column"} textAlign={"center"} gap={3}>
        <H4>Argent X can’t start</H4>
        <P3 color="neutrals.300">
          Sorry, an error occurred while starting the Argent X background
          process. Accounts are not affected. Please contact support for further
          instructions.
        </P3>
      </Center>
      <SupportFooter privacyStatement={false} />
    </Flex>
  )
}
