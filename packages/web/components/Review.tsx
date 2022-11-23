import { P4, icons } from "@argent/ui"
import { Box, Flex, Spinner } from "@chakra-ui/react"
import { FC, PropsWithChildren, useMemo } from "react"

import {
  EstimateDeploymentFeeResponse,
  EstimateFeeResponse,
} from "../services/estimateFee"
import { Review, reviewTransaction } from "../services/review"
import {
  TokenWithBalance,
  formatFeeTokenAmount,
} from "../services/tokens/balances"

const { InfoIcon } = icons

export const Block: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      w="100%"
      borderRadius={"lg"}
      boxShadow={"box"}
      border="1px solid #EDEDED"
      overflow={"hidden"}
    >
      {children}
    </Box>
  )
}

export const BlockContent: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      px={4}
      py={3}
      w="100%"
    >
      {children}
    </Box>
  )
}

export const BlockError: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Flex
      alignItems="center"
      justifyContent="center"
      w="100%"
      p={1}
      backgroundColor={"red.500"}
      color="white"
    >
      {children}
    </Flex>
  )
}

export const Row: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Flex alignItems="center" justifyContent="space-between" w="100%" p={1}>
      {children}
    </Flex>
  )
}

interface TransactionReviewProps {
  review?: Review
  deploymentFees?: EstimateDeploymentFeeResponse
  executionFees?: EstimateFeeResponse
  balanceTooLowToPayFees?: boolean
}

export const TransactionReview: FC<TransactionReviewProps> = ({
  deploymentFees,
  executionFees,
  review,
  balanceTooLowToPayFees,
}) => {
  if (!review) {
    return <Spinner />
  }

  return (
    <Flex w="100%" flexDirection="column" alignItems="center" gap={2} mb={8}>
      {review.blocks.map((block, index) => (
        <Block key={index}>
          <BlockContent>
            {block.rows.map((row, index) => (
              <Row key={index}>
                <P4 color="#8C8C8C">{row.title}</P4>
                <P4 ml={3}>{row.value}</P4>
              </Row>
            ))}
          </BlockContent>
        </Block>
      ))}
      <Block>
        <BlockContent>
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
        </BlockContent>
        {balanceTooLowToPayFees && (
          <BlockError>
            <P4>Insufficient balance to pay fees</P4>
          </BlockError>
        )}
      </Block>
    </Flex>
  )
}
