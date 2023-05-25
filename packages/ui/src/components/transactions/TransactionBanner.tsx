import {
  ApiTransactionReviewResponse,
  getDisplayWarnAndReasonForTransactionReview,
} from "@argent/shared"
import { Box, Flex, IconProps } from "@chakra-ui/react"
import { FC } from "react"

export interface ITransactionBanner {
  transactionReview: ApiTransactionReviewResponse | undefined
  icon: FC<IconProps>
}

export const TransactionBanner: FC<ITransactionBanner> = ({
  transactionReview,
  icon: Icon,
}) => {
  const { warn, reason } =
    getDisplayWarnAndReasonForTransactionReview(transactionReview)

  return (
    <>
      {warn && (
        <Flex
          backgroundColor={
            transactionReview?.assessment === "warn" ? "red.400" : "#02A697"
          }
          color="white"
          fontSize="xs"
          fontWeight="600"
          lineHeight="18px"
          py="3"
          px="4"
          borderRadius="8px"
          mb="3"
        >
          <Box mr="2">
            {/* ensures icon is visually centered with first line of text at 18px line height */}
            <Icon fontSize="inherit" h="18px" />
          </Box>
          {reason}
        </Flex>
      )}
    </>
  )
}
