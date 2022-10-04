import { partition } from "lodash-es"
import { hash, number } from "starknet"
import useSWR from "swr"
import useSWRImmutable from "swr/immutable"

import { getNetworkSelector } from "./../../../shared/account/selectors"
import { getAccounts } from "../../../shared/account/store"
import { Network } from "../../../shared/network"
import { getMulticallContract } from "../../services/multicall.service"
import { useNetwork } from "./../networks/useNetworks"
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
      number.toBN(currentImplementation).eq(number.toBN(targetImplementation)),
  )

  return !!targetImplementations && !isInKnownImplementationsList
}

export async function checkIfV4UpgradeAvailableOnNetwork(
  network: Network,
): Promise<boolean> {
  if (!network.accountClassHash) {
    return false
  }

  const multicallContract = getMulticallContract(network)

  if (!multicallContract) {
    throw Error("Multicall contract is required to check for upgrade")
  }

  const accounts = await getAccounts(getNetworkSelector(network.id))

  const calls = accounts.flatMap((acc) => [
    acc.address,
    hash.getSelectorFromName("get_implementation"),
    0,
  ])

  const response = await multicallContract.aggregate(calls)

  const implementations = response.result.map((r: any) =>
    number.toHex(r),
  ) as string[]

  const targetImplementations = Object.values(network.accountClassHash).map(
    (ti) => number.toBN(ti),
  )

  return implementations.some(
    (impl) => !targetImplementations.some((ti) => ti.eq(number.toBN(impl))),
  )
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
    throw Error("Mulitcall contract is required to check for upgrade")
  }

  const calls = accounts.flatMap((acc) => [
    acc.address,
    hash.getSelectorFromName("get_implementation"),
    0,
  ])

  const response = await multicallContract.aggregate(calls)

  const implementations = response.result.map((r: any) =>
    number.toHex(r),
  ) as string[]

  const implementationsToAccountsMap = accounts.reduce<Record<string, string>>(
    (acc, account, i) => ({
      ...acc,
      [account.address]: implementations[i],
    }),
    {},
  )

  const targetImplementations = Object.values(network.accountClassHash).map(
    (ti) => number.toBN(ti),
  )

  return partition(
    accounts,
    (account) =>
      !targetImplementations.some((ti) =>
        ti.eq(number.toBN(implementationsToAccountsMap[account.address])),
      ),
  )
}

export const useCheckV4UpgradeAvailable = (networkId: string) => {
  const network = useNetwork(networkId)

  return useSWRImmutable(
    [networkId, "v4-upgrade-check"],
    async () => await checkIfV4UpgradeAvailableOnNetwork(network),
  )
}

export const usePartitionDeprecatedAccounts = (
  accounts: Account[],
  network: Network,
) => {
  return useSWR(
    [network.id, accounts.length, "partition-deprecated-accounts"],
    async () => await partitionDeprecatedAccount(accounts, network),
    { refreshInterval: 30000, revalidateIfStale: true },
  )
}
