import { P4 } from "@argent/ui"
import { Flex, VStack } from "@chakra-ui/react"

import { formatTruncatedAddress } from "../../../services/addresses"
import { Account } from "../../accounts/Account"
import { PrettyAccountAddress } from "../../accounts/PrettyAccountAddress"

interface AccountNetworkInfoProps {
  account: Account
  to?: string
}

export const AccountNetworkInfo = ({
  account,
  to,
}: AccountNetworkInfoProps) => {
  return (
    <VStack
      borderRadius="xl"
      backgroundColor="neutrals.800"
      gap="3"
      px="3"
      py="3.5"
    >
      <Flex w="full" justifyContent="space-between" alignItems="flex-end">
        <P4 fontWeight="bold" color="neutrals.300" textAlign="end">
          From
        </P4>
        <PrettyAccountAddress
          size={6}
          accountAddress={account.address}
          networkId={account.networkId}
          bold
        />
      </Flex>
      {to && (
        <Flex w="full" justifyContent="space-between">
          <P4 fontWeight="bold" color="neutrals.300">
            To
          </P4>
          <P4>{formatTruncatedAddress(to)}</P4>
        </Flex>
      )}
      <Flex w="full" justifyContent="space-between" pb="1">
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
