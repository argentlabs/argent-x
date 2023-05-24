import { formatTruncatedAddress } from "@argent/shared"
import { Flex, VStack, useColorMode } from "@chakra-ui/react"
import { useMemo } from "react"

import { P4 } from "../Typography"
import { PrettyAccountAddress } from "./PrettyAccountAddress"

interface AccountNetworkInfoProps {
  accountAddress: string
  accountName?: string
  networkId: string
  networkName: string
  to?: string
}

export const AccountNetworkInfo = ({
  accountName,
  accountAddress,
  networkId,
  networkName,
  to,
}: AccountNetworkInfoProps) => {
  const { colorMode } = useColorMode()
  const isDark = useMemo(() => colorMode === "dark", [colorMode])
  return (
    <VStack
      w="100%"
      borderRadius="xl"
      backgroundColor={isDark ? "neutrals.800" : "white"}
      gap="3"
      px="3"
      py="3.5"
    >
      <Flex w="full" justifyContent="space-between" alignItems="flex-end">
        <P4
          fontWeight="bold"
          color={isDark ? "neutrals.300" : "black"}
          textAlign="end"
        >
          From
        </P4>
        <PrettyAccountAddress
          size={6}
          accountAddress={accountAddress}
          accountName={accountName}
          networkId={networkId}
          bold
        />
      </Flex>
      {to && (
        <Flex w="full" justifyContent="space-between">
          <P4 fontWeight="bold" color={isDark ? "neutrals.300" : "black"}>
            To
          </P4>
          <PrettyAccountAddress
            size={6}
            accountAddress={to}
            networkId={networkId}
            bold
          />
        </Flex>
      )}
      <Flex w="full" justifyContent="space-between" pb="1">
        <P4 fontWeight="bold" color={isDark ? "neutrals.300" : "black"}>
          Network
        </P4>
        <P4 fontWeight="bold">{networkName}</P4>
      </Flex>
    </VStack>
  )
}
