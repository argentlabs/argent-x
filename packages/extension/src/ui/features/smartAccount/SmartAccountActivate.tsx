import { FlowHeader, iconsDeprecated } from "@argent/x-ui"
import { Box, Center, Divider, VStack } from "@chakra-ui/react"
import { FC } from "react"

import { SmartAccountIconRow } from "./ui/SmartAccountIconRow"
import { SmartAccountLearnMoreButton } from "./ui/SmartAccountLearnMoreButton"

const { MobileIcon, RestoreIcon, LockIcon, SmartAccountActiveIcon } =
  iconsDeprecated

export const SmartAccountActivate: FC = () => {
  return (
    <>
      <FlowHeader
        variant={"primary"}
        title={"Smart Account"}
        subtitle={
          "Smart Account uses email to enable additional security features on your account"
        }
        icon={SmartAccountActiveIcon}
      />
      <VStack spacing={4} px={4} alignItems={"start"}>
        <SmartAccountIconRow icon={LockIcon}>
          Two-factor authentication (2FA)
        </SmartAccountIconRow>
        <Divider color={"neutrals.600"} width={"85%"} alignSelf={"center"} />
        <SmartAccountIconRow icon={MobileIcon}>
          Import your accounts to the Argent mobile app
        </SmartAccountIconRow>
        <Divider color={"neutrals.600"} width={"85%"} alignSelf={"center"} />
        <SmartAccountIconRow icon={RestoreIcon}>
          <Box>Recovery when seed phrase is lost</Box>
          <Box>(coming soon)</Box>
        </SmartAccountIconRow>
      </VStack>
      <Center flexDirection={"column"}>
        <SmartAccountLearnMoreButton />
      </Center>
    </>
  )
}
