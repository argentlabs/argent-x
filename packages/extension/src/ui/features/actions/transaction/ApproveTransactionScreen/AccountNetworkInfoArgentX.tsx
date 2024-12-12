import { P3, typographyStyles } from "@argent/x-ui"
import { Flex, VStack } from "@chakra-ui/react"

import type { WalletAccount } from "../../../../../shared/wallet.model"
import { PrettyAccountAddressArgentX } from "../../../accounts/PrettyAccountAddressArgentX"
import { formatTruncatedAddress } from "@argent/x-shared"

interface AccountNetworkInfoArgentXProps {
  account: WalletAccount
  to?: string
}

export const AccountNetworkInfoArgentX = ({
  account,
  to,
}: AccountNetworkInfoArgentXProps) => {
  return (
    <VStack
      borderRadius="xl"
      backgroundColor="neutrals.800"
      spacing={3}
      p={3}
      alignItems={"stretch"}
    >
      <Flex justifyContent="space-between" alignItems="center">
        <P3 fontWeight="medium" color="neutrals.300" textAlign="end">
          From
        </P3>
        <Flex {...typographyStyles.P3}>
          <PrettyAccountAddressArgentX
            size={6}
            accountAddress={account.address}
            networkId={account.networkId}
            accountId={account.id}
          />
        </Flex>
      </Flex>
      {to && (
        <Flex justifyContent="space-between">
          <P3 fontWeight="medium" color="neutrals.300">
            To
          </P3>
          <P3>{formatTruncatedAddress(to)}</P3>
        </Flex>
      )}
      <Flex justifyContent="space-between">
        <P3 fontWeight="medium" color="neutrals.300">
          Network
        </P3>
        <P3 fontWeight="medium" color="white">
          {account.network.name}
        </P3>
      </Flex>
    </VStack>
  )
}
