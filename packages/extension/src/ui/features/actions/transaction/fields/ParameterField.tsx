import { chakra } from "@chakra-ui/react"
import { FC } from "react"

import { IExplorerTransactionParameters } from "../../../../../shared/explorer/type"
import { entryPointToHumanReadable } from "../../../../../shared/transactions"
import { CopyIconButton } from "../../../../components/CopyIconButton"
import { Field, FieldKey, FieldValue } from "../../../../components/Fields"
import {
  formatTruncatedAddress,
  isValidAddress,
} from "../../../../services/addresses"
import { AccountAddressField } from "./AccountAddressField"

interface ParameterFieldProps {
  parameter: IExplorerTransactionParameters
  networkId?: string
}

const StyledCopyIconButton = chakra(CopyIconButton, {
  baseStyle: {
    position: "relative",
    left: 3,
  },
})

const ParameterFieldValue = chakra(FieldValue, {
  baseStyle: {
    display: "block",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden",
    marginLeft: 2,
  },
})

export const ParameterField: FC<ParameterFieldProps> = ({
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
