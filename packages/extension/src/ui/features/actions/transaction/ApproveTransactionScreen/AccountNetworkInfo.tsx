import { P4 } from "@argent/ui"
import { Flex, VStack } from "@chakra-ui/react"

import { formatTruncatedAddress } from "../../../../services/addresses"
import { Account } from "../../../accounts/Account"
import { PrettyAccountAddress } from "../../../accounts/PrettyAccountAddress"

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
      spacing={3}
      p={3}
      alignItems={"stretch"}
    >
      <Flex justifyContent="space-between" alignItems="center">
        <P4 fontWeight="medium" color="neutrals.300" textAlign="end">
          From
        </P4>
        <P4 fontWeight="medium">
          <PrettyAccountAddress
            size={6}
            accountAddress={account.address}
            networkId={account.networkId}
          />
        </P4>
      </Flex>
      {to && (
        <Flex justifyContent="space-between">
          <P4 fontWeight="medium" color="neutrals.300">
            To
          </P4>
          <P4>{formatTruncatedAddress(to)}</P4>
        </Flex>
      )}
      <Flex justifyContent="space-between">
        <P4 fontWeight="medium" color="neutrals.300">
          Network
        </P4>
        <P4 fontWeight="medium" color="white">
          {account.network.name}
        </P4>
      </Flex>
    </VStack>
  )
}
