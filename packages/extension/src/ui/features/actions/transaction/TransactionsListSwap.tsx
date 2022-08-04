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
  const isJediswap = swap.dapp?.name.toLowerCase() === "jediswap"
  return (
    <>
      <FieldGroup>
        <TokenField
          label="Sell"
          contractAddress={swap.src?.token.address}
          amount={swap.src?.amount}
          tokensByNetwork={tokensByNetwork}
        />
        <Field>
          <FieldKey>Value</FieldKey>
          <FieldValue>{prettifyCurrencyValue(swap.src?.usd)}</FieldValue>
        </Field>
        <Field>
          <FieldKey>Slippage</FieldKey>
          <FieldValue>
            {entryPointToHumanReadable(swap.src?.slippage || "–")}
          </FieldValue>
        </Field>
      </FieldGroup>
      <FieldGroup>
        <TokenField
          label="Receive"
          contractAddress={swap.dst?.token.address}
          amount={swap.dst?.amount}
          tokensByNetwork={tokensByNetwork}
        />
        <Field>
          <FieldKey>Value</FieldKey>
          <FieldValue>{prettifyCurrencyValue(swap.dst?.usd)}</FieldValue>
        </Field>
        <Field>
          <FieldKey>Slippage</FieldKey>
          <FieldValue>
            {entryPointToHumanReadable(swap.dst?.slippage || "–")}
          </FieldValue>
        </Field>
      </FieldGroup>
      <FieldGroup>
        <ContractField contractAddress={swap.dapp?.address} />
        <Field>
          <FieldKey>dApp</FieldKey>
          <FieldValue>
            {isJediswap && (
              <DappIconContainer>
                <DappIcon host="app.testnet.jediswap.xyz" />
              </DappIconContainer>
            )}
            <LeftPaddedField>{swap.dapp?.name || "Unknown"}</LeftPaddedField>
          </FieldValue>
        </Field>
      </FieldGroup>
    </>
  )
}
