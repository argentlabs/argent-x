import { useMemo } from "react"

import { BaseWalletAccount, WalletAccount } from "../../../shared/wallet.model"
import { accountFindFamily, selectedAccountView } from "../../views/account"
import { undefinedView } from "../../views/defaults"
import { useView } from "../../views/implementation/react"
import { Account } from "./Account"

// This file is used everywhere
// TODO: we should get rid of this and use the WalletAccount interface only (renaming it at some point)
export const mapWalletAccountsToAccounts = (
  walletAccounts: WalletAccount[],
): Account[] => {
  return walletAccounts.map(
    (walletAccount) =>
      new Account({
        name: walletAccount.name,
        address: walletAccount.address,
        network: walletAccount.network,
        signer: walletAccount.signer,
        hidden: walletAccount.hidden,
        type: walletAccount.type,
        guardian: walletAccount.guardian,
        escape: walletAccount.escape,
        needsDeploy: walletAccount.needsDeploy,
      }),
  )
}

export const useAccount = (
  account?: BaseWalletAccount,
): Account | undefined => {
  const view = useMemo(() => {
    return account ? accountFindFamily(account) : undefinedView
  }, [account])

  const foundAccount = useView(view)

  return useMemo(() => {
    return !foundAccount
      ? undefined
      : mapWalletAccountsToAccounts([foundAccount])[0]
  }, [foundAccount])
}

/**
 * @deprecated use `useView(selectedAccountView)` instead
 */
export const useSelectedAccount = (): Account | undefined => {
  const selectedAccount = useView(selectedAccountView)

  return useMemo(() => {
    return !selectedAccount
      ? undefined
      : mapWalletAccountsToAccounts([selectedAccount])[0]
  }, [selectedAccount])
}
