import { FC } from "react"

import {
  Erc20TransferCall,
  parseErc20TransferCall,
} from "../../../../shared/call/erc20TransferCall"
import { Token } from "../../../../shared/token/type"
import {
  Field,
  FieldGroup,
  FieldKey,
  FieldValue,
} from "../../../components/Fields"
import { useDisplayTokenAmountAndCurrencyValue } from "../../accountTokens/useDisplayTokenAmountAndCurrencyValue"
import { AccountAddressField } from "./fields/AccountAddressField"
import { TokenField } from "./fields/TokenField"

/** Renders an ERC20 transfer transaction */

export interface Erc20TransferCallTransactionItemProps {
  transaction: Erc20TransferCall
  tokensByNetwork: Token[]
  networkId: string
}

export const ERC20TransferTransactionDetails: FC<
  Erc20TransferCallTransactionItemProps
> = ({ transaction, tokensByNetwork, networkId }) => {
  const { contractAddress, recipientAddress, amount } =
    parseErc20TransferCall(transaction)

  const { displayValue } = useDisplayTokenAmountAndCurrencyValue({
    amount,
    tokenAddress: contractAddress,
  })

  return (
    <FieldGroup>
      <TokenField
        label="Send"
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
      <AccountAddressField
        title="To"
        accountAddress={recipientAddress}
        networkId={networkId}
      />
    </FieldGroup>
  )
}
