import { P4 } from "@argent/ui"
import { Flex, VStack } from "@chakra-ui/react"

import { Account } from "../../accounts/Account"
import { PrettyAccountAddress } from "../../accounts/PrettyAccountAddress"

interface AccountNetworkInfoProps {
  account: Account
}

export const AccountNetworkInfo = ({ account }: AccountNetworkInfoProps) => {
  return (
    <VStack
      borderRadius="xl"
      backgroundColor="neutrals.800"
      gap="3"
      px="3"
      py="3.5"
    >
      <Flex w="full" justifyContent="space-between">
        <P4 fontWeight="bold" color="neutrals.300">
          From
        </P4>
        <PrettyAccountAddress
          size={6}
          accountAddress={account.address}
          networkId={account.networkId}
          bold
        />
      </Flex>
      <Flex w="full" justifyContent="space-between">
        <P4 fontWeight="bold" color="neutrals.300">
          Network
        </P4>
        <P4 fontWeight="bold" color="white">
          {account.network.name}
        </P4>
      </Flex>
    </VStack>
  )
}
