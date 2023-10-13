import { TextWithAmount } from "@argent/ui"
import { BigNumberish } from "starknet"
import { FC } from "react"

import { prettifyTokenAmount } from "../../../../../shared/token/price"
import {
  Field,
  FieldKey,
  FieldValue,
  LeftPaddedField,
} from "../../../../components/Fields"
import { isEqualAddress } from "../../../../services/addresses"
import { TokenIcon } from "../../../accountTokens/TokenIcon"
import { Token } from "../../../../../shared/token/__new/types/token.model"

interface TokenFieldProps {
  label: string
  contractAddress?: string
  amount?: BigNumberish
  tokensByNetwork: Token[]
}

export const TokenField: FC<TokenFieldProps> = ({
  label,
  contractAddress,
  amount,
  tokensByNetwork,
}) => {
  if (!contractAddress || !amount) {
    return null
  }
  const token = tokensByNetwork.find(({ address }) =>
    isEqualAddress(address, contractAddress),
  )
  const displayAmount = token
    ? prettifyTokenAmount({
        amount,
        decimals: token?.decimals,
        symbol: token?.symbol || "Unknown",
      })
    : `${amount} Unknown`
  return (
    <Field>
      <FieldKey>{label}</FieldKey>
      <FieldValue>
        {token && <TokenIcon url={token.iconUrl} name={token.name} size={6} />}
        <TextWithAmount amount={amount.toString()} decimals={token?.decimals}>
          <LeftPaddedField>{displayAmount}</LeftPaddedField>
        </TextWithAmount>
      </FieldValue>
    </Field>
  )
}
