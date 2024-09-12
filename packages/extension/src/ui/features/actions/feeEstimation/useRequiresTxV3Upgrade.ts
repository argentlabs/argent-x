import useSWR from "swr"
import { accountService } from "../../../../shared/account/service"
import { accountsEqual } from "../../../../shared/utils/accountsEqual"
import { Token } from "../../../../shared/token/__new/types/token.model"
import {
  getAccountIdentifier,
  feeTokenNeedsTxV3Support,
  classHashSupportsTxV3,
  getLatestArgentAccountClassHash,
} from "@argent/x-shared"
import { WalletAccount } from "../../../../shared/wallet.model"

export function useRequiresTxV3Upgrade(
  account: WalletAccount | undefined,
  token: Token,
) {
  return useSWR(
    account
      ? [
          "requiresTxV3Upgrade",
          getAccountIdentifier(account),
          getAccountIdentifier(token),
          getLatestArgentAccountClassHash(), // update cache when class hash changes
        ]
      : null,
    async () => {
      const [selectedAccount] = await accountService.get((acc) =>
        accountsEqual(acc, account),
      )

      return (
        selectedAccount?.classHash &&
        feeTokenNeedsTxV3Support(token) &&
        !classHashSupportsTxV3(selectedAccount.classHash)
      )
    },
    {
      refreshInterval: 1000,
    },
  )
}
