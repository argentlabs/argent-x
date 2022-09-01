import { flatten, groupBy, toPairs } from "lodash-es"
import { Invocation, hash, number } from "starknet"

import { isEqualAddress } from "../../../ui/services/addresses"
import { getMulticallContract } from "../../../ui/services/multicall.service"
import { getNetwork, getProvider } from "../../network"
import { ArgentAccountType, WalletAccount } from "../../wallet.model"

export async function getAccountTypesFromChain(accounts: WalletAccount[]) {
  const accountsByNetwork = toPairs(groupBy(accounts, (a) => a.networkId))

  const accountTypeCallsByNetwork = accountsByNetwork.map(
    ([network, as]) =>
      [
        network,
        as.map((account): Invocation => {
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

          if (!network.accountClassHash?.argentPluginAccount) {
            return calls.map((call) => ({
              address: call.contractAddress,
              type: "argent",
            }))
          }

          const multicallContract = getMulticallContract(network)

          if (!multicallContract) {
            const provider = getProvider(network)
            const responses = await Promise.all(
              calls.map((call) => provider.callContract(call)),
            )
            const results: string[] = responses.map((res) =>
              number.toHex(number.toBN(res.result[0])),
            )
            return calls.map((call, i) => ({
              address: call.contractAddress,
              type: isEqualAddress(
                results[i],
                network.accountClassHash?.argentPluginAccount || "0x0",
              )
                ? "argent-plugin"
                : "argent",
            }))
          }

          const multicallCall = calls.flatMap(
            (call) =>
              [
                call.contractAddress,
                hash.getSelectorFromName(call.entrypoint),
                0,
              ] as const,
          )

          const response = await multicallContract.aggregate(multicallCall)

          const results: string[] = response.result.map((res: any) =>
            number.toHex(res),
          )

          return calls.map((call, i) => {
            const type = isEqualAddress(
              results[i],
              network.accountClassHash?.argentPluginAccount || "0x0",
            )
              ? "argent-plugin"
              : "argent"

            return {
              address: call.contractAddress,
              type,
            }
          })
        },
      ),
    ),
  )

  return accounts.map((account) => {
    const accountType = newAccountTypes.find((x) =>
      isEqualAddress(x.address, account.address),
    )?.type
    return {
      ...account,
      type: accountType || account.type || "argent",
    }
  })
}
