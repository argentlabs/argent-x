import { isUnlimitedAmount, prettifyTokenAmount } from "@argent/x-shared"
import { Flex, Text } from "@chakra-ui/react"

import type { Property } from "../../../../../../shared/transactionReview/schema"
import { TokenIcon } from "../../../../accountTokens/TokenIcon"

export function AmountProperty(
  property: Extract<Property, { type: "amount" }>,
) {
  const { amount, token } = property
  const value = prettifyTokenAmount({
    amount: amount,
    decimals: token.decimals ?? 1 /** if nft 1 */,
    symbol: token.symbol,
  })
  let color = undefined
  if (isUnlimitedAmount(amount)) {
    color = "warning.500"
  }
  return (
    <Flex
      gap="1"
      alignItems={"center"}
      ml={"auto"}
      justifyContent={"flex-end"}
      textAlign={"right"}
    >
      <TokenIcon url={token.iconUrl} name={token.name} size={4} />
      <Text color={color}>{value}</Text>
    </Flex>
  )
}
