import { H6, P4, iconsDeprecated } from "@argent/x-ui"
import { Flex, HStack } from "@chakra-ui/react"
// FIXME: remove when depricated accounts do not longer work
import { FC } from "react"

const { UpgradeIcon } = iconsDeprecated

export const DeprecatedAccountsWarning: FC = () => (
  <Flex
    pt={4}
    mt={4}
    px={2}
    pb={2}
    direction={"column"}
    gap={0.5}
    borderTop="1px solid"
    borderTopColor={"border"}
  >
    <HStack spacing={1} color={"primary.500"} align="flex-end">
      <H6>
        <UpgradeIcon />
      </H6>
      <H6>Upgrade required</H6>
    </HStack>
    {/* <P4 color={"neutrals.100"}>
      Upgrade the following accounts to continue using them
    </P4> */}
  </Flex>
)
