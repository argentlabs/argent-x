import { B3, P4, icons } from "@argent/ui"
import { Flex, Image, Square } from "@chakra-ui/react"

import { SimulationSummary } from "../../../../../../shared/transactionReview/schema"
import { TokenIcon } from "../../../../accountTokens/TokenIcon"
import { prettifyTokenAmount } from "../../../../../../shared/token/price"

const { ImageIcon } = icons

const isNft = (summary: SimulationSummary) =>
  summary.token.type === "ERC1155" || summary.token.type === "ERC721"

export function TransactionReviewSummary(summary: SimulationSummary) {
  if (isNft(summary)) {
    return NftSummary(summary)
  }
  return TokenSummary(summary)
}

function NftSummary(summary: SimulationSummary) {
  const { color, prefix } = getAttributes(summary)
  const { tokenIdDetails, token, value } = summary
  const displayName = tokenIdDetails?.name || token.name
  const imageSrc =
    tokenIdDetails?.imageUrls?.preview || token.imageUrls?.preview || ""
  const count = value ?? 1
  return (
    <Flex alignItems={"center"} w={"full"}>
      <Flex gap="2" alignItems={"center"}>
        <Square
          size={7}
          rounded={"md"}
          bg={"neutrals.600"}
          color={"text.secondary"}
          position={"relative"}
        >
          <ImageIcon fontSize={"xl"} />
          <Image
            position={"absolute"}
            left={0}
            right={0}
            top={0}
            bottom={0}
            display={"flex"}
            rounded={"lg"}
            src={imageSrc}
          />
        </Square>

        <B3>{displayName}</B3>
      </Flex>
      <B3 ml="auto" color={color}>
        {prefix}
        {count} NFT
      </B3>
    </Flex>
  )
}

function TokenSummary(summary: SimulationSummary) {
  const { value, usdValue, token } = summary
  const displayAmount = prettifyTokenAmount({
    amount: value || 0,
    decimals: token?.decimals || 18,
    symbol: token?.symbol || "Unknown token",
  })
  const { color, prefix } = getAttributes(summary)
  return (
    <Flex alignItems={"center"} w={"full"}>
      <Flex gap="2" alignItems={"center"}>
        <TokenIcon url={token.iconUrl} name={token.name} size={7} />
        <B3>{token.name}</B3>
      </Flex>
      <Flex ml="auto" gap={1} direction={"column"} textAlign={"right"}>
        <B3 color={color} data-testid={value}>
          {prefix}
          {displayAmount}
        </B3>
        {usdValue && <P4 color="text.secondary">${usdValue}</P4>}
      </Flex>
    </Flex>
  )
}

function getAttributes(summary: SimulationSummary) {
  return summary.sent
    ? { color: undefined, prefix: "–" }
    : {
        color: "success.500",
        prefix: "+",
      }
}
