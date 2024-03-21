import { FC } from "react"

import { B3, L1 } from "@argent/x-ui"
import { groupBy, isEmpty } from "lodash-es"
import type { Simulation } from "../../../../../shared/transactionReview/schema"
import { TransactionReviewSummary } from "./summary/TransactionReviewSummary"
import { TransactionReviewSummaryStack } from "./summary/TransactionReviewSummaryStack"

interface TransactionReviewSimulationProps {
  simulation: Simulation
}

export const TransactionReviewSimulation: FC<
  TransactionReviewSimulationProps
> = ({ simulation }) => {
  if (isEmpty(simulation?.summary)) {
    return (
      <TransactionReviewSummaryStack>
        <B3 color="text-secondary" textAlign="center" py={1}>
          No balance change
        </B3>
      </TransactionReviewSummaryStack>
    )
  }
  const { send, receive } = groupBy(simulation.summary, (summary) =>
    summary.sent ? "send" : "receive",
  )
  return (
    <TransactionReviewSummaryStack>
      {send && (
        <>
          <L1 color="text-secondary">Send</L1>
          {send.map((summary, index) => (
            <TransactionReviewSummary
              key={`send-${index}-${summary.type}`}
              {...summary}
            />
          ))}
        </>
      )}
      {receive && (
        <>
          <L1 color="text-secondary">Receive</L1>
          {receive.map((summary, index) => (
            <TransactionReviewSummary
              key={`send-${index}-${summary.type}`}
              {...summary}
            />
          ))}
        </>
      )}
    </TransactionReviewSummaryStack>
  )
}
