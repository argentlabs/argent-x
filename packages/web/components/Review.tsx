import { P4, icons } from "@argent/ui"
import { Box, Flex, Spinner } from "@chakra-ui/react"
import { sha1 as objectHash } from "object-hash"
import { FC, PropsWithChildren, useMemo } from "react"
import { Call } from "starknet"
import useSwr from "swr"

import {
  estimateDeployment,
  estimateTransactions,
} from "../services/estimateFee"
import { reviewTransaction } from "../services/review"
import { formatFeeTokenAmount } from "../services/tokens/balances"

const { InfoIcon } = icons

export const Block: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      px={4}
      py={3}
      w="100%"
      borderRadius={"lg"}
      boxShadow={"box"}
      border="1px solid #EDEDED"
    >
      {children}
    </Box>
  )
}

export const Row: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Flex alignItems="center" justifyContent="space-between" w="100%" p={1}>
      {children}
    </Flex>
  )
}

export const TransactionReview: FC<{
  transactions: Call[]
}> = ({ transactions }) => {
  const hash = useMemo(() => objectHash({ transactions }), [transactions])
  const { data: review } = useSwr(["services/review", hash], () =>
    reviewTransaction(transactions),
  )
  const { data: deploymentFees } = useSwr(
    "services/estimateFee/estimateDeployment",
    () => estimateDeployment(),
  )
  const { data: executionFees } = useSwr(
    ["services/estimateFee/estimateTransactions", hash],
    () => estimateTransactions(transactions),
  )
  if (!review) {
    return <Spinner />
  }

  return (
    <Flex w="100%" flexDirection="column" alignItems="center" gap={2} mb={8}>
      {review.blocks.map((block, index) => (
        <Block key={index}>
          {block.rows.map((row, index) => (
            <Row key={index}>
              <P4 color="#8C8C8C">{row.title}</P4>
              <P4 ml={3}>{row.value}</P4>
            </Row>
          ))}
        </Block>
      ))}
      <Block>
        <Row>
          <P4 color="#8C8C8C" display="flex" alignItems="center" gap={1}>
            Network fee
            <InfoIcon />
          </P4>
          {executionFees ? (
            <P4 ml={3}>{formatFeeTokenAmount(executionFees.fee)} ETH</P4>
          ) : (
            <Spinner size="sm" />
          )}
        </Row>
        {deploymentFees?.needsDeploy && (
          <Row>
            <P4 color="#8C8C8C" display="flex" alignItems="center" gap={1}>
              Deployment fee
              <InfoIcon />
            </P4>
            <P4 ml={3}>{formatFeeTokenAmount(deploymentFees.fee)} ETH</P4>
          </Row>
        )}
      </Block>
    </Flex>
  )
}
