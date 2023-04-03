import { icons } from "@argent/ui"
import { Center, VStack } from "@chakra-ui/react"
import { FC } from "react"

import { ShieldHeader } from "./ui/ShieldHeader"
import { ShieldIconRow } from "./ui/ShieldIconRow"
import { ShieldLearnMoreButton } from "./ui/ShieldLearnMoreButton"

const { EmailIcon, LockIcon, InfoIcon, ArgentShieldDeactivateIcon } = icons

export const ShieldAccountActivate: FC = () => {
  return (
    <>
      <ShieldHeader
        variant={"primary"}
        title={"Argent Shield"}
        subtitle={"By doing this you’ll protect your account with Argent:"}
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
        <ShieldIconRow icon={InfoIcon}>
          An account protected by Argent Shield cannot be used with other
          wallets
        </ShieldIconRow>
      </VStack>
      <Center flexDirection={"column"}>
        <ShieldLearnMoreButton />
      </Center>
    </>
  )
}
