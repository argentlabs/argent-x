import { FC } from "react"

import { FieldValue, LeftPaddedField } from "../../../../components/Fields"
import { formatTruncatedAddress } from "../../../../services/addresses"
import { Account } from "../../../accounts/Account"
import {
  getAccountName,
  useAccountMetadata,
} from "../../../accounts/accountMetadata.state"
import { getAccountImageUrl } from "../../../accounts/accounts.service"
import { TokenIcon } from "../../../accountTokens/TokenIcon"

interface AccountFieldProps {
  account: Account
}

export const AccountField: FC<AccountFieldProps> = ({ account }) => {
  const accountNames = useAccountMetadata((x) => x.accountNames)
  const accountName = getAccountName(account, accountNames)
  const accountImageUrl = getAccountImageUrl(accountName, account)
  return (
    <FieldValue>
      <TokenIcon url={accountImageUrl} name={account.address} small />
      <LeftPaddedField>
        {accountName || formatTruncatedAddress(account.address)}
      </LeftPaddedField>
    </FieldValue>
  )
}
