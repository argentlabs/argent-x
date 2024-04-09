import { Flex, Text } from "@chakra-ui/react"

import type { Property } from "../../../../../../shared/transactionReview/schema"
import { TokenIcon } from "../../../../accountTokens/TokenIcon"
import { AddressActions } from "./ui/AddressActions"
import { AddressTooltip } from "./ui/AddressTooltip"

export function TokenAddressProperty(
  property: Extract<Property, { type: "token_address" | "nft" }>,
) {
  const { token } = property
  return (
    <Flex
      flex="1"
      gap="1"
      alignItems={"center"}
      ml={"auto"}
      justifyContent={"flex-end"}
      textAlign={"right"}
      role={"group"}
    >
      <AddressActions address={token.address} />
      <AddressTooltip address={token.address}>
        <Flex gap={1}>
          <TokenIcon url={token.iconUrl} name={token.name} size={4} />
          <Text>{token.symbol}</Text>
        </Flex>
      </AddressTooltip>
    </Flex>
  )
}
