import { icons, P3 } from "@argent/x-ui"
import { Flex } from "@chakra-ui/react"
import React from "react"

const { LockPrimaryIcon, ResetPrimaryIcon, KeySecondaryIcon, MobileIcon } =
  icons

export const SmartAccountDetailedDescription: React.FC = () => {
  return (
    <Flex direction="column" mt={4}>
      <Flex>
        <LockPrimaryIcon color="stroke-brand" />
        <P3 ml={2} mb={1} sx={{ textWrap: "wrap" }}>
          Add 2FA when recovering your account
        </P3>
      </Flex>
      <Flex>
        <KeySecondaryIcon color="stroke-brand" />
        <P3 ml={2} mb={1} sx={{ textWrap: "wrap" }}>
          Seamless on-chain gaming with session keys
        </P3>
      </Flex>
      <Flex>
        <MobileIcon color="stroke-brand" />
        <P3 ml={2} mb={1} style={{ width: "wrap" }}>
          Use your account on any device
        </P3>
      </Flex>
      <Flex>
        <ResetPrimaryIcon color="stroke-brand" />
        <P3 ml={2} style={{ width: "fit-content" }}>
          Recovery without seed phrase (coming)
        </P3>
      </Flex>
    </Flex>
  )
}
