import { P4, iconsDeprecated } from "@argent/x-ui"
import { Flex } from "@chakra-ui/react"
import React from "react"
const { LockIcon, MobileIcon, RestoreIcon, KeyIcon } = iconsDeprecated

export const SmartAccountDetailedDescription: React.FC = () => {
  return (
    <Flex direction="column" mt={4}>
      <Flex>
        <LockIcon color="stroke-brand" />
        <P4 ml={2} mb={1} sx={{ textWrap: "wrap" }}>
          Two-factor authentication (2FA)
        </P4>
      </Flex>
      <Flex>
        <MobileIcon color="stroke-brand" />
        <P4 ml={2} mb={1} sx={{ textWrap: "wrap" }}>
          Import your accounts to the Argent mobile app
        </P4>
      </Flex>
      <Flex>
        <KeyIcon color="stroke-brand" />
        <P4 ml={2} mb={1} style={{ width: "wrap" }}>
          Experience seamless on-chain gaming with session keys
        </P4>
      </Flex>
      <Flex>
        <RestoreIcon color="stroke-brand" />
        <P4 ml={2} style={{ width: "fit-content" }}>
          Recovery when seed phrase is lost (coming soon)
        </P4>
      </Flex>
    </Flex>
  )
}
