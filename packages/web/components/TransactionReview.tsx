import { P4, icons } from "@argent/ui"
import { Flex, Spinner } from "@chakra-ui/react"
import { FC } from "react"

import {
  EstimateDeploymentFeeResponse,
  EstimateFeeResponse,
} from "../services/estimateFee"
import { Review } from "../services/review"
import { formatFeeTokenAmount } from "../services/tokens/balances"
import { Block, BlockContent, BlockError, Row } from "./Review"

const { InfoIcon } = icons

interface TransactionReviewProps {
  review?: Review
  deploymentFees?: EstimateDeploymentFeeResponse
  executionFees?: EstimateFeeResponse
  error?: Error
}

export const TransactionReview: FC<TransactionReviewProps> = ({
  deploymentFees,
  executionFees,
  review,
  error,
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
            ) : error ? (
              <P4 ml={3}>Error</P4>
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
        {error && (
          <BlockError>
            <P4>{error.message}</P4>
          </BlockError>
        )}
      </Block>
    </Flex>
  )
}
