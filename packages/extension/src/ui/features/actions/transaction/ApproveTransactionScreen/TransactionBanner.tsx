import { L1 } from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { FC, ReactNode } from "react"

import { ApiTransactionReviewAssessment } from "../../../../../shared/transactionReview.service"

interface TransactionBannerProps {
  variant?: ApiTransactionReviewAssessment
  icon: FC
  message?: ReactNode
}

export const TransactionBanner: FC<TransactionBannerProps> = ({
  variant,
  icon: Icon,
  message,
}) => {
  const color = variant === "warn" ? "primary.500" : "secondary.500"
  return (
    <Flex gap={2} px={3} py={4} mb={3} rounded={"lg"} backgroundColor={color}>
      <Flex>
        <Icon />
      </Flex>
      <L1>{message}</L1>
    </Flex>
  )
}
