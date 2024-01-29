import { isEqualAddress } from "@argent/shared"
import { useRef } from "react"
import useSWR from "swr"

import type { BaseWalletAccount } from "../../../shared/wallet.model"
import { getAccountIdentifier } from "../../../shared/wallet.service"
import { accountMessagingService } from "../../services/accountMessaging"
import { accountFindFamily } from "../../views/account"
import { useView } from "../../views/implementation/react"

export const useAccountOwnerIsSelf = (baseAccount?: BaseWalletAccount) => {
  const publicKey = useRef<string>()
  const account = useView(accountFindFamily(baseAccount))
  const { data: accountOwnerIsSelf = true } = useSWR(
    account ? [getAccountIdentifier(account), "accountOwnerIsSelf"] : null,
    async () => {
      if (!account?.owner) {
        /** don't return false negative  */
        return true
      }
      if (!publicKey.current) {
        publicKey.current = await accountMessagingService.getPublicKey(account)
      }
      const accountOwnerIsSelf = isEqualAddress(
        account.owner,
        publicKey.current,
      )
      return accountOwnerIsSelf
    },
  )
  return accountOwnerIsSelf
}
