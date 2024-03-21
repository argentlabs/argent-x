import { Flex, FlexProps } from "@chakra-ui/react"

export function TransactionReviewSummaryStack(props: FlexProps) {
  return (
    <Flex
      direction={"column"}
      w={"full"}
      gap={3}
      p={3}
      rounded={"lg"}
      bg="surface-elevated"
      {...props}
    />
  )
}
