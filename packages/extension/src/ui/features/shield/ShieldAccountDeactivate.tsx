import { icons } from "@argent/ui"
import { Center, VStack } from "@chakra-ui/react"
import { FC } from "react"

import { ShieldHeader } from "./ui/ShieldHeader"
import { ShieldIconRow } from "./ui/ShieldIconRow"
import { ShieldLearnMoreButton } from "./ui/ShieldLearnMoreButton"
import { useRouteAccount } from "./useRouteAccount"

const { InfoIcon } = icons

export const ShieldAccountDeactivate: FC = () => {
  const account = useRouteAccount()
  const accountName = account ? account.name : undefined

  return (
    <>
      <ShieldHeader
        variant={"primary"}
        title={"Remove Argent Shield"}
        subtitle={`Two-factor account protection will be removed from ${accountName}`}
      />
      <VStack spacing={4} px={4} alignItems={"start"}>
        <ShieldIconRow icon={InfoIcon}>
          Anyone with your private key will be able to start transactions
        </ShieldIconRow>
      </VStack>
      <Center flexDirection={"column"}>
        <ShieldLearnMoreButton />
      </Center>
    </>
  )
}
