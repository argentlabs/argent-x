import { CellStack } from "@argent/x-ui"
import type { FC } from "react"
import type { WalletAccount } from "../../../shared/wallet.model"
import { AccountListItemWithBalance } from "../accounts/AccountListItemWithBalance"

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
        key={account.id}
        accountId={account.id}
        account={account}
        avatarSize={9}
        accountAddress={account.address}
        networkId={account.networkId}
        accountName={account.name}
        isSmartAccount={account.type === "smart"}
        isLedger={account.signer.type === "ledger"}
        onClick={() => onAccountClick(account)}
      />
    ))}
  </CellStack>
)

export { AccountListWithBalance }
