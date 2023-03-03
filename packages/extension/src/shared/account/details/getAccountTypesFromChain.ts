import { flatten, groupBy, toPairs } from "lodash-es"
import { Call, number } from "starknet"

import { isEqualAddress } from "../../../ui/services/addresses"
import { getMulticallForNetwork } from "../../multicall"
import { getNetwork, getProvider } from "../../network"
import { mapImplementationToArgentAccountType } from "../../network/utils"
import { ArgentAccountType, WalletAccount } from "../../wallet.model"

export type AccountTypesFromChain = Pick<
  WalletAccount,
  "address" | "networkId" | "type"
>

export async function getAccountTypesFromChain(
  accounts: WalletAccount[],
): Promise<AccountTypesFromChain[]> {
  const accountsByNetwork = toPairs(groupBy(accounts, (a) => a.networkId))

  const accountTypeCallsByNetwork = accountsByNetwork.map(
    ([network, as]) =>
      [
        network,
        as.map((account): Call => {
          return {
            contractAddress: account.address,
            entrypoint: "get_implementation",
          }
        }),
      ] as const,
  )

  const newAccountTypes = flatten(
    await Promise.all(
      accountTypeCallsByNetwork.map(
        async ([networkId, calls]): Promise<
          Array<{
            address: string
            type: ArgentAccountType
          }>
        > => {
          const network = await getNetwork(networkId)

          const hasOnlyArgentAccounts =
            network.accountClassHash &&
            Object.entries(network.accountClassHash).every(
              ([key, value]) => key === "argent" || value === undefined,
            )

          if (hasOnlyArgentAccounts) {
            return calls.map((call) => ({
              address: call.contractAddress,
              type: "standard",
            }))
          }

          if (network.multicallAddress) {
            const multicall = getMulticallForNetwork(network)
            const responses = await Promise.all(
              calls.map((call) => multicall.call(call)),
            )
            const result = responses.map((response, i) => {
              const call = calls[i]
              const type: ArgentAccountType =
                mapImplementationToArgentAccountType(response[0], network)
              return {
                address: call.contractAddress,
                type,
              }
            })
            return result
          }
          /** fallback to single calls */
          const provider = getProvider(network)
          const responses = await Promise.all(
            calls.map((call) => provider.callContract(call)),
          )
          const results: string[] = responses.map((res) =>
            number.toHex(number.toBN(res.result[0])),
          )
          return calls.map((call, i) => ({
            address: call.contractAddress,
            type: mapImplementationToArgentAccountType(results[i], network),
          }))
        },
      ),
    ),
  )

  return accounts.map((account) => {
    const accountType = newAccountTypes.find((x) =>
      isEqualAddress(x.address, account.address),
    )?.type
    const { address, networkId } = account
    return {
      address,
      networkId,
      type: accountType || account.type || "argent",
    }
  })
}
