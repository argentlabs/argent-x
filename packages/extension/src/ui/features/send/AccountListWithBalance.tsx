import { CellStack } from "@argent/x-ui"
import { FC } from "react"
import { WalletAccount } from "../../../shared/wallet.model"
import { AccountListItemWithBalance } from "../accounts/AccountListItemWithBalance"
import { getAccountIdentifier } from "@argent/x-shared"

interface AccountListWithBalanceProps {
  accounts: WalletAccount[]
  onAccountClick: (account: WalletAccount) => void
}

const AccountListWithBalance: FC<AccountListWithBalanceProps> = ({
  accounts,
  onAccountClick,
}) => (
  <CellStack px={0} pt={4}>
    {accounts.map((account) => (
      <AccountListItemWithBalance
        key={getAccountIdentifier(account)}
        account={account}
        avatarSize={9}
        accountAddress={account.address}
        networkId={account.networkId}
        accountName={account.name}
        onClick={() => onAccountClick(account)}
      />
    ))}
  </CellStack>
)

export { AccountListWithBalance }
