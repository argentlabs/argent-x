import { useMemo } from "react"

import { BaseWalletAccount, WalletAccount } from "../../../shared/wallet.model"
import { accountFindFamily, selectedAccountView } from "../../views/account"
import { undefinedView } from "../../views/defaults"
import { useView } from "../../views/implementation/react"
import { Account } from "./Account"
import { accountService } from "../../../shared/account/service"

export const migrateAccountNetworks = async (accounts: WalletAccount[]) => {
  const hasOldAccountNetwork = accounts.some((account) => {
    return "baseUrl" in account.network
  })

  if (!hasOldAccountNetwork) {
    console.log("No old account network found")
    return accounts
  }

  const migratedAccounts = accounts.map((account) => {
    if (
      "baseUrl" in account.network &&
      typeof account.network.baseUrl === "string"
    ) {
      const updated = {
        ...account,
        network: {
          ...account.network,
          sequencerUrl: account.network.baseUrl,
        },
      }

      delete updated.network.baseUrl

      return updated
    }

    return account
  })

  await accountService.upsert(migratedAccounts)

  return migratedAccounts
}

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
        classHash: walletAccount.classHash,
        cairoVersion: walletAccount.cairoVersion,
        guardian: walletAccount.guardian,
        escape: walletAccount.escape,
        needsDeploy: walletAccount.needsDeploy,
      }),
  )
}

export const useWalletAccount = (account?: BaseWalletAccount) => {
  const view = useMemo(() => {
    return account ? accountFindFamily(account) : undefinedView
  }, [account])

  return useView(view)
}

export const useAccount = (
  account?: BaseWalletAccount,
): Account | undefined => {
  const foundAccount = useWalletAccount(account)

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
