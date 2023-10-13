import { FC } from "react"

import { Field, FieldKey, LeftPaddedField } from "../../../../components/Fields"
import {
  PrettyAccountAddressArgentX,
  PrettyAccountAddressArgentXProps,
} from "../../../accounts/PrettyAccountAddressArgentX"

interface AccountAddressFieldProps extends PrettyAccountAddressArgentXProps {
  title: string
}

export const AccountAddressField: FC<AccountAddressFieldProps> = ({
  title,
  ...rest
}) => {
  return (
    <Field>
      <FieldKey>{title}</FieldKey>
      <LeftPaddedField>
        <PrettyAccountAddressArgentX size={6} {...rest} />
      </LeftPaddedField>
    </Field>
  )
}
