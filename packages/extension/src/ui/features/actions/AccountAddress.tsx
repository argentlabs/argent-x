import { FC } from "react"

import {
  Field,
  FieldGroup,
  FieldKey,
  FieldValue,
} from "../../components/Fields"
import { Account } from "../accounts/Account"
import { AccountAddressField } from "./transaction/fields/AccountAddressField"

interface AccountAddressProps {
  selectedAccount: Account
}

export const AccountAddress: FC<AccountAddressProps> = ({
  selectedAccount,
}) => (
  <FieldGroup>
    <AccountAddressField
      title="From"
      accountAddress={selectedAccount.address}
      networkId={selectedAccount.network.id}
    />
    <Field>
      <FieldKey>Network</FieldKey>
      <FieldValue>{selectedAccount.network.name}</FieldValue>
    </Field>
  </FieldGroup>
)
