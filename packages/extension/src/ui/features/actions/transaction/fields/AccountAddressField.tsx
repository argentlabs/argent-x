import { FC, ReactNode } from "react"

import { Field, FieldKey, LeftPaddedField } from "../../../../components/Fields"
import { PrettyAccountAddress } from "../../../accounts/PrettyAccountAddress"

interface AccountAddressFieldProps {
  title: string
  accountAddress: string
  networkId: string
  fallbackValue?: (accountAddress: string) => ReactNode
}

export const AccountAddressField: FC<AccountAddressFieldProps> = ({
  title,
  accountAddress,
  networkId,
  fallbackValue,
}) => {
  return (
    <Field>
      <FieldKey>{title}</FieldKey>
      <LeftPaddedField>
        <PrettyAccountAddress
          size={6}
          accountAddress={accountAddress}
          networkId={networkId}
          fallbackValue={fallbackValue}
        />
      </LeftPaddedField>
    </Field>
  )
}
