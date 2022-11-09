import { partition } from "lodash-es"
import { hash, number } from "starknet"
import useSWR from "swr"

import { getAccountIdentifier } from "./../../../shared/wallet.service"
import { getAccounts } from "../../../shared/account/store"
import { Network } from "../../../shared/network"
import { getMulticallContract } from "../../services/multicall.service"
import { fetchFeeTokenBalanceForAccounts } from "./../accountTokens/tokens.service"
import { useCurrentNetwork, useNetwork } from "./../networks/useNetworks"
import { Account } from "./Account"

export async function checkIfUpgradeAvailable(
  account: Account,
  targetClassHash?: Network["accountClassHash"],
): Promise<boolean> {
  if (!targetClassHash) {
    return false
  }

  const currentImplementation = await account.getCurrentImplementation()

  // Just show for not deprecated accounts, as targetImplementation will always be a contract class hash, which is not supported by the old proxy
  // const oldAccount = isDeprecated(account)

  // matches all current target implementations. If you want to change the account type please do it using a different flow than this banner
  const targetImplementations = Object.values(targetClassHash)

  const isInKnownImplementationsList = targetImplementations.some(
    (targetImplementation) =>
      currentImplementation &&
      number.toBN(currentImplementation).eq(number.toBN(targetImplementation)),
  )

  return !!targetImplementations && !isInKnownImplementationsList
}

export async function checkIfV4UpgradeAvailableOnNetwork(
  network: Network,
  onlyHidden = false,
): Promise<boolean> {
  if (!network.accountClassHash) {
    return false
  }

  const multicallContract = getMulticallContract(network)

  if (!multicallContract) {
    throw Error("Multicall contract is required to check for upgrade")
  }

  const accounts = await getAccounts(
    (acc) =>
      acc.networkId === network.id &&
      onlyHidden === Boolean(acc.hidden) &&
      !acc.needsDeploy,
  )

  const calls = accounts.flatMap((acc) => [
    acc.address,
    hash.getSelectorFromName("get_implementation"),
    0,
  ])

  try {
    const implementationMulticall = multicallContract.aggregate(calls)

    const response = await Promise.race([
      implementationMulticall,
      new Promise(
        (_, reject) =>
          setTimeout(() => reject(new Error("multicall timeout")), 15000), // as it takes around 30s for multicall to fail
      ),
    ])

    const implementations = response.result.map((r: any) =>
      number.toHex(r),
    ) as string[]

    const targetImplementations = Object.values(network.accountClassHash).map(
      (ti) => number.toBN(ti),
    )

    const oldAccountAddresses = implementations
      .filter(
        (impl) => !targetImplementations.some((ti) => ti.eq(number.toBN(impl))),
      )
      .map((_, i) => accounts[i].address)

    const feeTokenBalances = await fetchFeeTokenBalanceForAccounts(
      oldAccountAddresses,
      network,
    )

    return Object.values(feeTokenBalances).some((balance) => balance.gt(0))
  } catch (error) {
    console.error("Error checking for account upgrade on network", error)
    return false
  }
}

export async function partitionDeprecatedAccount(
  accounts: Account[],
  network: Network,
): Promise<[Account[], Account[]]> {
  if (!network.accountClassHash) {
    return [[], accounts]
  }

  const multicallContract = getMulticallContract(network)

  if (!multicallContract) {
    throw Error("Multicall contract is required to check for upgrade")
  }

  const deployedAccounts = accounts.filter((acc) => !acc.needsDeploy)

  const calls = deployedAccounts.flatMap((acc) => [
    acc.address,
    hash.getSelectorFromName("get_implementation"),
    0,
  ])

  try {
    const implementationMulticall = multicallContract.aggregate(calls)

    const response = await Promise.race([
      implementationMulticall,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("multicall timeout")), 15000),
      ),
    ])

    const implementations = response.result.map((r: any) =>
      number.toHex(r),
    ) as string[]

    const { argentAccount, argentPluginAccount } = network.accountClassHash

    const implementationsToAccountsMap = accounts.reduce<
      Record<string, string | undefined>
    >((acc, account, i) => {
      if (implementations[i]) {
        return {
          ...acc,
          [account.address]: implementations[i],
        }
      }

      const currentImpl =
        account.type === "argent" ? argentAccount : argentPluginAccount

      return {
        ...acc,
        [account.address]: currentImpl,
      }
    }, {})

    const targetImplementations = Object.values(network.accountClassHash).map(
      (ti) => number.toBN(ti),
    )

    return partition(
      accounts,
      (account) =>
        !targetImplementations.some((ti) => {
          const impl = implementationsToAccountsMap[account.address]
          if (impl) {
            return ti.eq(number.toBN(impl))
          }
          return false
        }),
    )
  } catch (error) {
    console.error("Error while checking for deprecated accounts", error)
    return [[], accounts]
  }
}

export const useCheckV4UpgradeAvailable = (
  networkId: string,
  onlyHidden = false,
) => {
  const network = useNetwork(networkId)

  return useSWR(
    [networkId, onlyHidden, "v4-upgrade-check"],
    async () => await checkIfV4UpgradeAvailableOnNetwork(network, onlyHidden),
  )
}

export const usePartitionDeprecatedAccounts = (
  accounts: Account[],
  network: Network,
) => {
  return useSWR(
    [
      network.id,
      accounts.length,
      "partition-deprecated-accounts",
      "whatever___",
    ],
    () => partitionDeprecatedAccount(accounts, network),
    { refreshInterval: 30000, revalidateIfStale: true },
  )
}

export const useCheckUpgradeAvailable = (account?: Account) => {
  const { accountClassHash } = useCurrentNetwork()

  const accountIdentifier = account && getAccountIdentifier(account)

  const {
    data: needsUpgrade,
    error: needsUpgradeError,
    isValidating: needsUpgradeValidating,
  } = useSWR(
    [accountIdentifier, accountClassHash, "showUpgradeBanner"],
    () => account && checkIfUpgradeAvailable(account, accountClassHash),
    { suspense: false },
  )

  return { needsUpgrade, needsUpgradeError, needsUpgradeValidating }
}
