import { P4 } from "@argent/ui"
import { Flex, VStack } from "@chakra-ui/react"

import { formatTruncatedAddress } from "../../../../services/addresses"
import { Account } from "../../../accounts/Account"
import { PrettyAccountAddress } from "../../../accounts/PrettyAccountAddress"

interface AccountNetworkInfoProps {
  account?: Account
  networkName?: string
  to?: string
}

export const AccountNetworkInfo = ({
  account,
  networkName,
  to,
}: AccountNetworkInfoProps) => {
  const network = networkName || account?.network.name

  return (
    <VStack
      borderRadius="xl"
      backgroundColor="neutrals.800"
      gap="3"
      px="3"
      py="3.5"
    >
      {account && (
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
      )}
      {to && (
        <Flex w="full" justifyContent="space-between">
          <P4 fontWeight="bold" color="neutrals.300">
            To
          </P4>
          <P4>{formatTruncatedAddress(to)}</P4>
        </Flex>
      )}
      {network && (
        <Flex w="full" justifyContent="space-between" pb={account ? "1" : "0"}>
          <P4 fontWeight="bold" color="neutrals.300">
            Network
          </P4>
          <P4 fontWeight="bold" color="white">
            {network}
          </P4>
        </Flex>
      )}
    </VStack>
  )
}
