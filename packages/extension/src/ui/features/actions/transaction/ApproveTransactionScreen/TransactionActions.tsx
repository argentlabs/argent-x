import {
  DetailAccordion,
  DetailAccordionButton,
  DetailAccordionHeader,
  DetailAccordionItem,
  DetailAccordionPanel,
  DetailAccordionRow,
} from "@argent/ui"
import { Box } from "@chakra-ui/react"
import { FC } from "react"
import { Call, number } from "starknet"

import { entryPointToHumanReadable } from "../../../../../shared/transactions"
import { formatTruncatedAddress } from "../../../../services/addresses"

export interface TransactionActionsProps {
  transactions: Call[]
}

export const TransactionActions: FC<TransactionActionsProps> = ({
  transactions,
}) => {
  return (
    <Box>
      <DetailAccordionHeader>Actions</DetailAccordionHeader>
      <DetailAccordion>
        {transactions.map((transaction, txIndex) => (
          <DetailAccordionItem
            key={txIndex}
            isDisabled={
              !transaction.calldata || transaction.calldata?.length === 0
            }
          >
            <DetailAccordionButton
              label={entryPointToHumanReadable(transaction.entrypoint)}
              value={formatTruncatedAddress(transaction.contractAddress)}
            />
            <DetailAccordionPanel>
              {transaction.calldata?.map((calldata, cdIndex) => (
                <DetailAccordionRow
                  key={cdIndex}
                  label={`Calldata ${cdIndex + 1}`}
                  value={
                    number.isHex(calldata)
                      ? formatTruncatedAddress(calldata)
                      : calldata
                  }
                  copyValue={calldata}
                />
              ))}
            </DetailAccordionPanel>
          </DetailAccordionItem>
        ))}
      </DetailAccordion>
    </Box>
  )
}
