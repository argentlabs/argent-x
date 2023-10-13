import { P4, typographyStyles } from "@argent/ui"
import { Flex, VStack } from "@chakra-ui/react"

import { WalletAccount } from "../../../../../shared/wallet.model"
import { formatTruncatedAddress } from "../../../../services/addresses"
import { PrettyAccountAddressArgentX } from "../../../accounts/PrettyAccountAddressArgentX"

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
        <P4 fontWeight="medium" color="neutrals.300" textAlign="end">
          From
        </P4>
        <Flex {...typographyStyles.P4}>
          <PrettyAccountAddressArgentX
            size={6}
            accountAddress={account.address}
            networkId={account.networkId}
          />
        </Flex>
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
