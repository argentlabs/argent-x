import { FC } from "react"
import styled from "styled-components"

import { IExplorerTransactionParameters } from "../../../../../shared/explorer/type"
import { entryPointToHumanReadable } from "../../../../../shared/transactions"
import { CopyIconButton } from "../../../../components/CopyIconButton"
import { Field, FieldKey, FieldValue } from "../../../../components/Fields"
import {
  formatTruncatedAddress,
  isValidAddress,
} from "../../../../services/addresses"
import { AccountAddressField } from "./AccountAddressField"

interface IParameterField {
  parameter: IExplorerTransactionParameters
  networkId?: string
}

const StyledCopyIconButton = styled(CopyIconButton)`
  position: relative;
  left: 12px;
`

const ParameterFieldValue = styled(FieldValue)`
  display: block;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin-left: 8px;
`

export const ParameterField: FC<IParameterField> = ({
  parameter,
  networkId,
}) => {
  const { name, value } = parameter
  let isAddress = false
  try {
    isAddress = isValidAddress(value)
  } catch (e) {
    // ignore parse error
  }
  const displayName = entryPointToHumanReadable(name)
  if (isAddress && networkId) {
    const fallbackValue = (accountAddress: string) => {
      return (
        <StyledCopyIconButton size="s" variant="transparent" copyValue={value}>
          {formatTruncatedAddress(accountAddress)}
        </StyledCopyIconButton>
      )
    }
    return (
      <AccountAddressField
        title={displayName}
        accountAddress={value}
        networkId={networkId}
        fallbackValue={fallbackValue}
      />
    )
  }
  return (
    <Field>
      <FieldKey>{displayName}</FieldKey>
      <ParameterFieldValue>{value}</ParameterFieldValue>
    </Field>
  )
}
