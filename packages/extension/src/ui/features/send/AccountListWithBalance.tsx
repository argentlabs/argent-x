import { CellStack } from "@argent/x-ui"
import type { FC } from "react"
import type { WalletAccount } from "../../../shared/wallet.model"
import { AccountListItemWithBalance } from "../accounts/AccountListItemWithBalance"

import { typographyStyles } from "@argent/x-ui/theme"

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
        accountType={account.type}
        avatarSize={9}
        emojiStyle={typographyStyles.H3}
        initialsStyle={typographyStyles.H4}
        accountAddress={account.address}
        avatarMeta={account.avatarMeta}
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
