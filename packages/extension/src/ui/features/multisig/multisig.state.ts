import { useMemo } from "react"

import {
  BasePendingMultisig,
  PendingMultisig,
} from "../../../shared/multisig/types"
import {
  withHiddenPendingMultisig,
  withoutHiddenPendingMultisig,
} from "../../../shared/multisig/utils/selectors"
import {
  BaseMultisigWalletAccount,
  BaseWalletAccount,
  MultisigWalletAccount,
} from "../../../shared/wallet.model"
import { accountsEqual } from "../../../shared/utils/accountsEqual"
import { allAccountsView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import { Multisig } from "./Multisig"
import {
  multisigBaseWalletView,
  pendingMultisigsView,
} from "../../views/multisig"

export const mapMultisigWalletAccountsToMultisig = (
  walletAccounts: MultisigWalletAccount[],
): Multisig[] => {
  return walletAccounts.map(
    (walletAccount) =>
      new Multisig({
        name: walletAccount.name,
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
        creator: walletAccount.creator,
        publicKey: walletAccount.publicKey,
      }),
  )
}

export function useBaseMultisigAccounts() {
  return useView(multisigBaseWalletView)
}

export function useMultisigAccounts() {
  const accounts = useView(allAccountsView)
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
          ...walletAccount,
          ...baseMultisigAccount,
          type: "multisig",
        }
      })
      .filter((account): account is MultisigWalletAccount => !!account)
  }, [accounts, baseMultisigAccounts])
}

export function useMultisigWalletAccount(base?: BaseWalletAccount) {
  const multisigAccounts = useMultisigAccounts()

  return useMemo(() => {
    if (!base) {
      return
    }
    return multisigAccounts.find((multisigAccount) =>
      accountsEqual(multisigAccount, base),
    )
  }, [base, multisigAccounts])
}

export function useMultisig(base?: BaseWalletAccount) {
  const multisigWalletAccount = useMultisigWalletAccount(base)

  return useMemo(() => {
    if (!multisigWalletAccount) {
      return
    }

    return new Multisig({
      name: multisigWalletAccount.name,
      address: multisigWalletAccount.address,
      network: multisigWalletAccount.network,
      signer: multisigWalletAccount.signer,
      hidden: multisigWalletAccount.hidden,
      type: multisigWalletAccount.type,
      guardian: multisigWalletAccount.guardian,
      escape: multisigWalletAccount.escape,
      needsDeploy: multisigWalletAccount.needsDeploy,
      signers: multisigWalletAccount.signers,
      threshold: multisigWalletAccount.threshold,
      creator: multisigWalletAccount.creator,
      publicKey: multisigWalletAccount.publicKey,
    })
  }, [multisigWalletAccount])
}

export function isZeroMultisigAccount(account: BaseMultisigWalletAccount) {
  return account.signers.length === 0 && account.threshold === 0
}

export function usePendingMultisigs({
  showHidden = false,
  allNetworks = false,
} = {}) {
  const network = useCurrentNetwork()
  const pendingMultisigs = useView(pendingMultisigsView)

  return useMemo(
    () =>
      pendingMultisigs
        .filter((pendingMultisigs) => {
          /** omit if custom network no longer exists */
          return pendingMultisigs.networkId !== undefined
        })
        .filter(
          allNetworks
            ? () => true
            : (pendingMultisig) => pendingMultisig.networkId === network.id,
        )
        .filter(
          showHidden ? withHiddenPendingMultisig : withoutHiddenPendingMultisig,
        ),
    [pendingMultisigs, allNetworks, network.id, showHidden],
  )
}

export const usePendingMultisigsOnNetwork = ({
  networkId,
  showHidden = false,
}: {
  networkId: string
  showHidden: boolean
}) => {
  const accounts = useView(pendingMultisigsView)

  return useMemo(
    () =>
      accounts
        .filter((pendingMultisig) => pendingMultisig.networkId === networkId)
        .filter(
          showHidden ? withHiddenPendingMultisig : withoutHiddenPendingMultisig,
        ),
    [accounts, networkId, showHidden],
  )
}

export function usePendingMultisig(base?: BasePendingMultisig) {
  const pendingMultisigs = usePendingMultisigs()

  return useMemo(() => {
    if (!base) {
      return
    }
    return pendingMultisigs.find(
      (pendingMultisig) => pendingMultisig.publicKey === base.publicKey,
    )
  }, [base, pendingMultisigs])
}

export const isHiddenPendingMultisig = (pm: PendingMultisig) => !!pm.hidden
