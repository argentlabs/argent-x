import { FC } from "react"
import styled from "styled-components"

import { prettifyCurrencyValue } from "../../../../shared/token/price"
import { Token } from "../../../../shared/token/type"
import {
  ApiTransactionReviewResponse,
  getTransactionReviewSwap,
} from "../../../../shared/transactionReview.service"
import { entryPointToHumanReadable } from "../../../../shared/transactions"
import {
  Field,
  FieldGroup,
  FieldKey,
  FieldValue,
  LeftPaddedField,
} from "../../../components/Fields"
import { DappIcon } from "../connectDapp/DappIcon"
import { ContractField } from "./fields/ContractField"
import { TokenField } from "./fields/TokenField"

const DappIconContainer = styled.div`
  width: 24px;
  height: 24px;
`

export interface ITransactionsListSwap {
  transactionReview?: ApiTransactionReviewResponse
  tokensByNetwork?: Token[]
}

export const TransactionsListSwap: FC<ITransactionsListSwap> = ({
  transactionReview,
  tokensByNetwork = [],
}) => {
  const swap = getTransactionReviewSwap(transactionReview)
  if (!swap) {
    return null
  }
  /** API only checks Jediswap at present */
  const isJediswap =
    transactionReview?.targetedDapp.name.toLowerCase() === "jediswap"
  const { activity, assessmentDetails } = swap

  return (
    <>
      <FieldGroup>
        <TokenField
          label="Sell"
          contractAddress={activity?.src?.token.address}
          amount={activity?.src?.amount}
          tokensByNetwork={tokensByNetwork}
        />
        <Field>
          <FieldKey>Value</FieldKey>
          <FieldValue>{prettifyCurrencyValue(activity?.src?.usd)}</FieldValue>
        </Field>
        <Field>
          <FieldKey>Slippage</FieldKey>
          <FieldValue>
            {entryPointToHumanReadable(activity?.src?.slippage || "–")}
          </FieldValue>
        </Field>
      </FieldGroup>
      <FieldGroup>
        <TokenField
          label="Receive"
          contractAddress={activity?.dst?.token.address}
          amount={activity?.dst?.amount}
          tokensByNetwork={tokensByNetwork}
        />
        <Field>
          <FieldKey>Value</FieldKey>
          <FieldValue>{prettifyCurrencyValue(activity?.dst?.usd)}</FieldValue>
        </Field>
        <Field>
          <FieldKey>Slippage</FieldKey>
          <FieldValue>
            {entryPointToHumanReadable(activity?.dst?.slippage || "–")}
          </FieldValue>
        </Field>
      </FieldGroup>
      <FieldGroup>
        <ContractField contractAddress={assessmentDetails.contract_address} />
        <Field>
          <FieldKey>dApp</FieldKey>
          <FieldValue>
            {isJediswap && (
              <DappIconContainer>
                <DappIcon host="app.testnet.jediswap.xyz" />
              </DappIconContainer>
            )}
            <LeftPaddedField>
              {transactionReview?.targetedDapp.name || "Unknown"}
            </LeftPaddedField>
          </FieldValue>
        </Field>
      </FieldGroup>
    </>
  )
}
