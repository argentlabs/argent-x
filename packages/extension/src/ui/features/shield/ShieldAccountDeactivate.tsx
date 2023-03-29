import { FlowHeader, icons } from "@argent/ui"
import { Center, VStack } from "@chakra-ui/react"
import { FC } from "react"

import {
  getAccountName,
  useAccountMetadata,
} from "../accounts/accountMetadata.state"
import { ShieldIconRow } from "./ui/ShieldIconRow"
import { ShieldLearnMoreButton } from "./ui/ShieldLearnMoreButton"
import { useRouteAccount } from "./useRouteAccount"

const { InfoIcon, ArgentShieldIcon } = icons

export const ShieldAccountDeactivate: FC = () => {
  const account = useRouteAccount()
  const { accountNames } = useAccountMetadata()
  const accountName = account
    ? getAccountName(account, accountNames)
    : undefined

  return (
    <>
      <FlowHeader
        variant={"primary"}
        title={"Remove Argent Shield"}
        subtitle={`Two-factor account protection will be removed from ${accountName}`}
        icon={ArgentShieldIcon}
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
