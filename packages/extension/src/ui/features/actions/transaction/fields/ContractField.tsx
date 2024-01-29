import { FC } from "react"

import { CopyTooltip } from "../../../../components/CopyTooltip"
import { Field, FieldKey, FieldValue } from "../../../../components/Fields"
import { ContentCopyIcon } from "../../../../components/Icons/MuiIcons"
import { formatTruncatedAddress } from "@argent/shared"

interface ContractFieldProps {
  contractAddress?: string
}

export const ContractField: FC<ContractFieldProps> = ({ contractAddress }) => {
  if (!contractAddress) {
    return null
  }
  const displayContractAddress = formatTruncatedAddress(contractAddress)
  return (
    <Field>
      <FieldKey>
        Contract
        <CopyTooltip message="Copied" copyValue={contractAddress}>
          <ContentCopyIcon
            style={{ fontSize: 12, marginLeft: "0.5em", cursor: "pointer" }}
          />
        </CopyTooltip>
      </FieldKey>
      <FieldValue>{displayContractAddress}</FieldValue>
    </Field>
  )
}
