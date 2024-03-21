import { Flex } from "@chakra-ui/react"
import { useMemo } from "react"

import type { Property } from "../../../../../../shared/transactionReview/schema"
import { PrettyAccountAddressArgentX } from "../../../../accounts/PrettyAccountAddressArgentX"
import { useCurrentNetwork } from "../../../../networks/hooks/useCurrentNetwork"
import { AddressActions } from "./ui/AddressActions"
import { AddressTooltip } from "./ui/AddressTooltip"

export function AddressProperty(
  property: Extract<Property, { type: "address" }>,
) {
  const network = useCurrentNetwork()
  const { addressName, address } = property

  const value = useMemo(() => {
    if (addressName) {
      return addressName
    }
    return (
      <PrettyAccountAddressArgentX
        accountAddress={address}
        networkId={network.id}
        size={5}
      />
    )
  }, [address, addressName, network.id])

  return (
    <Flex
      flex="1"
      gap="1"
      alignItems={"center"}
      justifyContent={"flex-end"}
      role="group"
    >
      <AddressActions address={address} />
      <AddressTooltip address={address}>{value}</AddressTooltip>
    </Flex>
  )
}
