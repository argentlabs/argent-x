import { BigNumberish } from "ethers"
import { FC } from "react"

import { prettifyTokenAmount } from "../../../../../shared/token/price"
import { Token } from "../../../../../shared/token/type"
import {
  Field,
  FieldKey,
  FieldValue,
  LeftPaddedField,
} from "../../../../components/Fields"
import { isEqualAddress } from "../../../../services/addresses"
import { TokenIconDeprecated } from "../../../accountTokens/TokenIconDeprecated"

export interface ITokenField {
  label: string
  contractAddress?: string
  amount?: BigNumberish
  tokensByNetwork: Token[]
}

export const TokenField: FC<ITokenField> = ({
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
        {token && (
          <TokenIconDeprecated url={token.image} name={token.name} small />
        )}
        <LeftPaddedField>{displayAmount}</LeftPaddedField>
      </FieldValue>
    </Field>
  )
}
