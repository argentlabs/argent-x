import {
  DetailAccordion,
  DetailAccordionButton,
  DetailAccordionHeader,
  DetailAccordionItem,
  DetailAccordionPanel,
  DetailAccordionRow,
} from "@argent/x-ui"
import { Box } from "@chakra-ui/react"
import { FC } from "react"
import { CallData, num } from "starknet"

import { entryPointToHumanReadable } from "../../../../../shared/transactions"
import { TransactionActionsType } from "../types"
import { formatCalldataSafe } from "../../utils"
import { formatTruncatedAddress } from "@argent/x-shared"
import { TransactionReviewProperty } from "@argent/x-ui/simulation"
import { Property } from "@argent/x-shared/simulation"

export interface TransactionActionsProps {
  action: TransactionActionsType
  networkId: string
}

export const TransactionActions: FC<TransactionActionsProps> = ({
  action,
  networkId,
}) => {
  return (
    <Box>
      <DetailAccordionHeader>Actions</DetailAccordionHeader>
      <DetailAccordion>
        {/** Render Activate Account / Multisig Action*/}
        {action.type === "DEPLOY_ACCOUNT" && (
          <DetailAccordionItem
            key={action.payload.accountAddress}
            isDisabled={!action.payload.classHash}
          >
            <DetailAccordionButton
              label={
                action.payload.type === "multisig"
                  ? "Activate Multisig"
                  : "Activate Account"
              }
              value={formatTruncatedAddress(action.payload.accountAddress)}
            />
            <DetailAccordionPanel>
              {action.payload.classHash && (
                <DetailAccordionRow
                  label="Class hash"
                  value={
                    num.isHex(action.payload.classHash)
                      ? formatTruncatedAddress(action.payload.classHash)
                      : action.payload.classHash
                  }
                  copyValue={action.payload.classHash}
                />
              )}
            </DetailAccordionPanel>
          </DetailAccordionItem>
        )}

        {/** Render Add Guardian */}
        {action.type === "ADD_GUARDIAN" && (
          <DetailAccordionItem key={action.payload.accountAddress} isDisabled>
            <DetailAccordionButton
              label="Add Guardian"
              value={formatTruncatedAddress(action.payload.accountAddress)}
            />
            <DetailAccordionPanel />
          </DetailAccordionItem>
        )}

        {/** Render Remove Guardian */}
        {action.type === "REMOVE_GUARDIAN" && (
          <DetailAccordionItem key={action.payload.accountAddress} isDisabled>
            <DetailAccordionButton
              label="Remove Guardian"
              value={formatTruncatedAddress(action.payload.accountAddress)}
            />
            <DetailAccordionPanel />
          </DetailAccordionItem>
        )}

        {/** Render INVOKE_FUNCTION Calls */}
        {action.type === "INVOKE_FUNCTION" &&
          action.payload.map((transaction, txIndex) => {
            const property: Property = {
              type: "address",
              address: transaction.contractAddress,
              label: entryPointToHumanReadable(transaction.entrypoint),
              verified: false,
            }
            return (
              <DetailAccordionItem
                key={txIndex}
                isDisabled={
                  !transaction.calldata || transaction.calldata?.length === 0
                }
              >
                <DetailAccordionButton>
                  <TransactionReviewProperty
                    property={property}
                    networkId={networkId}
                  />
                </DetailAccordionButton>
                <DetailAccordionPanel>
                  {CallData.toCalldata(
                    formatCalldataSafe(transaction.calldata),
                  ).map((calldata, cdIndex) => (
                    <DetailAccordionRow
                      key={cdIndex}
                      label={`Calldata ${cdIndex + 1}`}
                      value={
                        num.isHex(calldata)
                          ? formatTruncatedAddress(calldata)
                          : calldata
                      }
                      copyValue={calldata}
                    />
                  ))}
                </DetailAccordionPanel>
              </DetailAccordionItem>
            )
          })}
      </DetailAccordion>
    </Box>
  )
}
