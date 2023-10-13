import { partition } from "lodash-es"
import { num } from "starknet"

import { isDeprecatedTxV0 } from "../../../shared/wallet.service"
import { Network } from "../../../shared/network"
import { BaseWalletAccount, WalletAccount } from "../../../shared/wallet.model"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import { STANDARD_CAIRO_0_ACCOUNT_CLASS_HASH } from "../../../shared/network/constants"
import { useMemo } from "react"
import { useWalletAccount } from "./accounts.state"
import { Account } from "./Account"

export function checkIfUpgradeAvailable(
  account: WalletAccount,
  targetClassHash?: Network["accountClassHash"],
): boolean {
  if (!targetClassHash) {
    return false
  }

  try {
    if (!account.classHash) {
      return false
    }

    const currentImplementation = account.classHash

    // Just show for not deprecated accounts, as targetImplementation will always be a contract class hash, which is not supported by the old proxy
    // const oldAccount = isDeprecated(account)

    // matches all current target implementations. If you want to change the account type please do it using a different flow than this banner
    const targetImplementations = Object.values(targetClassHash).filter(
      (classHash) => classHash !== STANDARD_CAIRO_0_ACCOUNT_CLASS_HASH,
    ) // TODO: remove the filter. currently needed as we want to support cairo 0 accounts for testing. after testing we will remove it as a valid target implementation

    const isInKnownImplementationsList = targetImplementations.some(
      (targetImplementation) =>
        num.toBigInt(currentImplementation) ===
        num.toBigInt(targetImplementation),
    )

    return !!targetImplementations && !isInKnownImplementationsList
  } catch (e) {
    console.error(e)
    return false
  }
}

export function checkIfDeprecated(walletAccount: WalletAccount): boolean {
  if (walletAccount.showBlockingDeprecated) {
    return true
  }
  return isDeprecatedTxV0(walletAccount)
}

export function partitionDeprecatedAccount(
  accounts: WalletAccount[],
  network: Network,
): [string[], string[]] {
  const accountAddresses = accounts.map((account) => account.address)

  if (!network.accountClassHash) {
    return [[], accountAddresses]
  }

  try {
    const implementationsToAccountsMap = accounts.reduce<
      Record<string, string | undefined>
    >(
      (acc, account) => ({
        ...acc,
        [account.address]: account.classHash,
      }),
      {},
    )

    const targetImplementations = Object.values(network.accountClassHash).map(
      (ti) => num.toBigInt(ti),
    )

    return partition(accountAddresses, (accountAddress) =>
      targetImplementations.some((ti) => {
        const impl = implementationsToAccountsMap[accountAddress]
        return !!impl && num.toBigInt(impl) === ti
      }),
    )
  } catch (error) {
    console.error("Error while checking for deprecated accounts", error)
    return [accountAddresses, []]
  }
}

export const usePartitionDeprecatedAccounts = (
  accounts: WalletAccount[],
  network: Network,
) => {
  return useMemo(
    () => partitionDeprecatedAccount(accounts, network),
    [accounts, network],
  )
}

export const useCheckUpgradeAvailable = (account?: Account | WalletAccount) => {
  const { accountClassHash } = useCurrentNetwork()

  if (!account) {
    return false
  }

  return checkIfUpgradeAvailable(account, accountClassHash)
}

export const useIsDeprecatedTxV0 = (account: BaseWalletAccount) => {
  const walletAccount = useWalletAccount(account)

  return useMemo(() => {
    if (!walletAccount) {
      return false
    }

    return checkIfDeprecated(walletAccount)
  }, [walletAccount])
}
