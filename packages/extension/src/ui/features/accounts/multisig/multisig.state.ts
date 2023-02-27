import { useMemo } from "react"

import { multisigBaseWalletStore } from "../../../../shared/multisig/store"
import { useArrayStorage } from "../../../../shared/storage/hooks"
import {
  BaseMultisigWalletAccount,
  BaseWalletAccount,
  MultisigWalletAccount,
} from "../../../../shared/wallet.model"
import { accountsEqual } from "../../../../shared/wallet.service"
import { useAccounts } from "../accounts.state"
import { Multisig } from "./Multisig"

export const mapMultisigWalletAccountsToMultisig = (
  walletAccounts: MultisigWalletAccount[],
): Multisig[] => {
  return walletAccounts.map(
    (walletAccount) =>
      new Multisig({
        address: walletAccount.address,
        network: walletAccount.network,
        signer: walletAccount.signer,
        hidden: walletAccount.hidden,
        type: walletAccount.type,
        guardian: walletAccount.guardian,
        escape: walletAccount.escape,
        needsDeploy: walletAccount.needsDeploy,
        signers: walletAccount.signers,
        threshold: walletAccount.threshold,
      }),
  )
}

export function useBaseMultisigAccounts() {
  return useArrayStorage(multisigBaseWalletStore)
}

export function useMultisigAccounts() {
  const accounts = useAccounts({ allNetworks: true, showHidden: true })
  const baseMultisigAccounts = useBaseMultisigAccounts()

  return useMemo(() => {
    return baseMultisigAccounts
      .map((baseMultisigAccount) => {
        const walletAccount = accounts.find((walletAccount) =>
          accountsEqual(walletAccount, baseMultisigAccount),
        )

        if (!walletAccount) {
          return undefined
        }

        return {
          ...walletAccount.toWalletAccount(),
          ...baseMultisigAccount,
          type: "multisig",
        }
      })
      .filter((account): account is MultisigWalletAccount => !!account)
  }, [accounts, baseMultisigAccounts])
}

export function useMultisigAccount(base: BaseWalletAccount) {
  const multisigAccounts = useMultisigAccounts()

  return useMemo(() => {
    return multisigAccounts.find((multisigAccount) =>
      accountsEqual(multisigAccount, base),
    )
  }, [base, multisigAccounts])
}

export function isZeroMultisigAccount(account: BaseMultisigWalletAccount) {
  return account.signers.length === 0 && account.threshold === 0
}
