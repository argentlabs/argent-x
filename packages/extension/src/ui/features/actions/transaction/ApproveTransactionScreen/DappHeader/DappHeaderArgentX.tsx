import { H5, P4 } from "@argent/x-ui"
import { Box, Flex } from "@chakra-ui/react"
import { FC, useMemo } from "react"
import { Call } from "starknet"

import { ReviewOfTransaction } from "@argent/x-shared/simulation"
import { KnownDappButtonWrapper } from "../../../connectDapp/KnownDappButtonWrapper"
import { ApproveScreenType } from "../../types"
import { AggregatedSimData } from "../../useTransactionSimulatedData"
import { TransactionIcon } from "./TransactionIcon"
import { TransactionTitleArgentX } from "./TransactionTitleArgentX"

export interface DappHeaderArgentXProps {
  transactions?: Call[]
  transactionReview?: ReviewOfTransaction
  aggregatedData?: AggregatedSimData[]
  approveScreenType: ApproveScreenType
}

export const DappHeaderArgentX: FC<DappHeaderArgentXProps> = ({
  transactions,
  transactionReview,
  aggregatedData,
  approveScreenType,
}) => {
  const targetedDappWebsite = useMemo(
    () =>
      transactionReview?.targetedDapp?.links.find((l) => l.name === "website"),
    [transactionReview?.targetedDapp?.links],
  )
  return (
    <Box mb="6">
      <Flex
        direction="column"
        justifyContent="center"
        alignItems="center"
        gap="3"
      >
        <TransactionIcon
          transactionReview={transactionReview}
          aggregatedData={aggregatedData}
          verifiedDapp={transactionReview?.targetedDapp}
          approveScreenType={approveScreenType}
        />

        <Flex
          direction="column"
          justifyContent="center"
          alignItems="center"
          gap="0.5"
        >
          <H5>
            <TransactionTitleArgentX
              transactionReview={transactionReview}
              aggregatedData={aggregatedData}
              fallback={
                transactions && transactions.length > 1
                  ? "transactions"
                  : "transaction"
              }
              approveScreenType={approveScreenType}
            />
          </H5>
          {targetedDappWebsite && (
            <Flex alignItems="center">
              <P4 color="neutrals.300" sx={{ marginTop: 0 }} pr={1}>
                {targetedDappWebsite.url}
              </P4>
              <KnownDappButtonWrapper dappHost={targetedDappWebsite.url} />
            </Flex>
          )}
        </Flex>
      </Flex>
    </Box>
  )
}
