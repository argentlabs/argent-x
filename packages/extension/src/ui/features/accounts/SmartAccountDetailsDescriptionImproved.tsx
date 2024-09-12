import { P4, iconsDeprecated } from "@argent/x-ui"
import { Flex } from "@chakra-ui/react"
import React from "react"
const { LockIcon, MobileIcon, RestoreIcon, KeyIcon } = iconsDeprecated

export const SmartAccountDetailedDescriptionImproved: React.FC = () => {
  return (
    <Flex direction="column" mt={4}>
      <Flex>
        <LockIcon color="stroke-brand" />
        <P4 ml={2} mb={1} sx={{ textWrap: "wrap" }}>
          Add 2FA when recovering your account
        </P4>
      </Flex>
      <Flex>
        <KeyIcon color="stroke-brand" />
        <P4 ml={2} mb={1} sx={{ textWrap: "wrap" }}>
          Seamless on-chain gaming with session keys
        </P4>
      </Flex>
      <Flex>
        <MobileIcon color="stroke-brand" />
        <P4 ml={2} mb={1} style={{ width: "wrap" }}>
          Use your account on any device
        </P4>
      </Flex>
      <Flex>
        <RestoreIcon color="stroke-brand" />
        <P4 ml={2} style={{ width: "fit-content" }}>
          Recovery without seed phrase (coming)
        </P4>
      </Flex>
    </Flex>
  )
}
