import useSWR from "swr"
import { Account } from "../../accounts/Account"
import { accountService } from "../../../../shared/account/service"
import { accountsEqual } from "../../../../shared/utils/accountsEqual"
import {
  classHashSupportsTxV3,
  feeTokenNeedsTxV3Support,
} from "../../../../shared/network/txv3"
import { Token } from "../../../../shared/token/__new/types/token.model"
import { getAccountIdentifier } from "@argent/x-shared"

export function useRequiresTxV3Upgrade(
  account: Account | undefined,
  token: Token,
) {
  return useSWR(
    account
      ? [
          "requiresTxV3Upgrade",
          getAccountIdentifier(account),
          getAccountIdentifier(token),
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
