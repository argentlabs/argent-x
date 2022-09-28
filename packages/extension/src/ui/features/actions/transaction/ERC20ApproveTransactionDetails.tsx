import { FC } from "react"

import {
  Erc20ApproveCall,
  parseErc20ApproveCall,
} from "../../../../shared/call/erc20ApproveCall"
import { Token } from "../../../../shared/token/type"
import {
  Field,
  FieldGroup,
  FieldKey,
  FieldValue,
} from "../../../components/Fields"
import { useDisplayTokenAmountAndCurrencyValue } from "../../accountTokens/useDisplayTokenAmountAndCurrencyValue"
import { TokenField } from "./fields/TokenField"

/** Renders an ERC20 approve transaction */

export interface Erc20ApproveCallTransactionItemProps {
  transaction: Erc20ApproveCall
  tokensByNetwork: Token[]
  networkId: string
}

export const ERC20ApproveTransactionDetails: FC<
  Erc20ApproveCallTransactionItemProps
> = ({ transaction, tokensByNetwork }) => {
  const { contractAddress, amount } = parseErc20ApproveCall(transaction)

  const { displayValue } = useDisplayTokenAmountAndCurrencyValue({
    amount,
    tokenAddress: contractAddress,
  })

  return (
    <FieldGroup>
      <TokenField
        label="Approve"
        amount={amount}
        contractAddress={contractAddress}
        tokensByNetwork={tokensByNetwork}
      />
      {!!displayValue && (
        <Field>
          <FieldKey>Value</FieldKey>
          <FieldValue>{displayValue}</FieldValue>
        </Field>
      )}
    </FieldGroup>
  )
}
