import { useMemo } from "react"

import { atom } from "jotai"
import { atomFamily } from "jotai/utils"
import type {
  BasePendingMultisig,
  PendingMultisig,
} from "../../../shared/multisig/types"
import {
  withHiddenPendingMultisig,
  withoutHiddenPendingMultisig,
} from "../../../shared/multisig/utils/selectors"
import {
  accountsEqual,
  atomFamilyAccountsEqual,
  atomFamilyIsEqualAccountIds,
  isEqualAccountIds,
} from "../../../shared/utils/accountsEqual"
import type {
  AccountId,
  BaseMultisigWalletAccount,
  BaseWalletAccount,
  MultisigWalletAccount,
  WalletAccount,
} from "../../../shared/wallet.model"
import { isNetworkOnlyPlaceholderAccount } from "../../../shared/wallet.model"
import { allAccountsView, selectedBaseAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import {
  multisigBaseWalletView,
  pendingMultisigsView,
} from "../../views/multisig"
import { isEqualAddress } from "@argent/x-shared"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import { atomWithDebugLabel } from "../../views/atomWithDebugLabel"

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

export function useMultisigWalletAccount(id?: AccountId) {
  const multisigAccounts = useMultisigAccounts()

  return useMemo(() => {
    if (!id) {
      return
    }
    return multisigAccounts.find((multisigAccount) =>
      isEqualAccountIds(multisigAccount.id, id),
    )
  }, [id, multisigAccounts])
}

export const selectedMultisigView = atom(async (get) => {
  const account = await get(selectedBaseAccountView)
  if (!account || isNetworkOnlyPlaceholderAccount(account)) {
    return
  }
  return get(multisigView(account))
})

export const multisigView = atomFamily(
  (account?: BaseWalletAccount) =>
    atomWithDebugLabel(
      atom(async (get) => {
        const accounts = await get(allAccountsView)
        const baseMultisigAccounts = await get(multisigBaseWalletView)

        const baseMultisigAccount = baseMultisigAccounts.find(
          (multisigAccount) => accountsEqual(multisigAccount, account),
        )

        const walletAccount = accounts.find((walletAccount) =>
          accountsEqual(walletAccount, account),
        )

        if (!walletAccount || !baseMultisigAccount) {
          return
        }

        const multisigWalletAccount: MultisigWalletAccount = {
          ...walletAccount,
          ...baseMultisigAccount,
          type: "multisig",
        }

        return multisigWalletAccount
      }),
      `multisigView-${account?.id || "unknown"}`,
    ),
  atomFamilyAccountsEqual,
)

export const multisigByIdView = atomFamily(
  (accountId?: AccountId) =>
    atomWithDebugLabel(
      atom(async (get) => {
        const accounts = await get(allAccountsView)
        const baseMultisigAccounts = await get(multisigBaseWalletView)

        const baseMultisigAccount = baseMultisigAccounts.find(
          (multisigAccount) => isEqualAccountIds(multisigAccount.id, accountId),
        )

        const walletAccount = accounts.find((walletAccount) =>
          isEqualAccountIds(walletAccount.id, accountId),
        )

        if (!walletAccount || !baseMultisigAccount) {
          return
        }

        const multisigWalletAccount: MultisigWalletAccount = {
          ...walletAccount,
          ...baseMultisigAccount,
          type: "multisig",
        }

        return multisigWalletAccount
      }),
      `multisigByIdView-${accountId || "unknown"}`,
    ),
  atomFamilyIsEqualAccountIds,
)

export const baseMultisigView = atomFamily(
  (account?: BaseWalletAccount) =>
    atomWithDebugLabel(
      atom(async (get) => {
        const baseMultisigAccounts = await get(multisigBaseWalletView)

        const baseMultisigAccount = baseMultisigAccounts.find(
          (multisigAccount) => accountsEqual(multisigAccount, account),
        )

        return baseMultisigAccount
      }),
      `baseMultisigView-${account?.id || "unknown"}`,
    ),
  atomFamilyAccountsEqual,
)

export const isSignerInMultisigView = atomFamily(
  (account?: BaseWalletAccount) =>
    atomWithDebugLabel(
      atom(async (get) => {
        const multisig = await get(baseMultisigView(account))
        if (!multisig) {
          return false
        }
        const isSigner = multisig.signers.some((signer) =>
          isEqualAddress(signer, multisig.publicKey),
        )
        const hasPendingSignerChange = !!multisig.pendingSigner
        return isSigner || hasPendingSignerChange
      }),
      `isSignerInMultisigView-${account?.id || "unknown"}`,
    ),
  atomFamilyAccountsEqual,
)

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

export const multisigIsPending = (
  multisig: WalletAccount | PendingMultisig,
): multisig is PendingMultisig => {
  return "publicKey" in multisig && !("address" in multisig)
}
