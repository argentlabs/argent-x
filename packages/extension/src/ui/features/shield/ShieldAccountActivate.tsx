import { FlowHeader, icons } from "@argent/ui"
import { Center, VStack } from "@chakra-ui/react"
import { FC } from "react"

import { ShieldIconRow } from "./ui/ShieldIconRow"
import { ShieldLearnMoreButton } from "./ui/ShieldLearnMoreButton"

const { EmailIcon, LockIcon, ArgentShieldDeactivateIcon, ArgentShieldIcon } =
  icons

export const ShieldAccountActivate: FC = () => {
  return (
    <>
      <FlowHeader
        variant={"primary"}
        title={"Argent Shield"}
        subtitle={"By doing this you’ll protect your account with Argent:"}
        icon={ArgentShieldIcon}
      />
      <VStack spacing={4} px={4} alignItems={"start"}>
        <ShieldIconRow icon={EmailIcon}>
          Protect your account with two-factor authentication using an email
          address
        </ShieldIconRow>
        <ShieldIconRow icon={LockIcon}>
          Needed once per device, and re-verified every 30 days
        </ShieldIconRow>
        <ShieldIconRow icon={ArgentShieldDeactivateIcon}>
          Remove Argent Shield at any time
        </ShieldIconRow>
      </VStack>
      <Center flexDirection={"column"}>
        <ShieldLearnMoreButton />
      </Center>
    </>
  )
}
