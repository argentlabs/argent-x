import { Multicall } from "@argent/x-multicall"
import { flatten, groupBy, toPairs } from "lodash-es"
import { Call, number } from "starknet"

import { isEqualAddress } from "../../../ui/services/addresses"
import { getNetwork, getProvider } from "../../network"
import { ArgentAccountType, WalletAccount } from "../../wallet.model"

export async function getAccountTypesFromChain(accounts: WalletAccount[]) {
  const accountsByNetworkDict = groupBy(accounts, (a) => a.networkId)

  const accountsByNetwork = toPairs(accountsByNetworkDict)

  // const accountTypesByNetwork = Object.keys(accountsByNetworkDict).map(
  //   async (
  //     networkId,
  //   ): Promise<
  //     Array<{
  //       address: string
  //       type: ArgentAccountType
  //     }>
  //   > => {
  //     const accounts = accountsByNetworkDict[networkId]
  //     const network = await getNetwork(networkId)

  //     i(!multicall)

  //     const multicall = new Multicall(getProvider(network), network.multicallAddress)

  //     const accountTypes = await Promise.all()
  //     return [networkId, accountTypes]
  //   },
  // )

  const implementationCall = (address: string): Call => ({
    contractAddress: address,
    entrypoint: "get_implementation",
  })

  const newAccountTypes = flatten(
    await Promise.all(
      accountsByNetwork.map(
        async ([networkId, accounts]): Promise<
          Array<{
            address: string
            type: ArgentAccountType
          }>
        > => {
          const network = await getNetwork(networkId)

          if (!network.accountClassHash?.argentPluginAccount) {
            return accounts.map((acc) => ({
              address: acc.address,
              type: "argent",
            }))
          }

          if (!network.multicallAddress) {
            const provider = getProvider(network)
            const responses = await Promise.all(
              accounts.map((acc) =>
                provider.callContract({
                  contractAddress: acc.address,
                  entrypoint: "get_implementation",
                }),
              ),
            )
            const results: string[] = responses.map((res) =>
              number.toHex(number.toBN(res.result[0])),
            )
            return accounts.map((acc, i) => ({
              address: acc.address,
              type: isEqualAddress(
                results[i],
                network.accountClassHash?.argentPluginAccount || "0x0",
              )
                ? "argent-plugin"
                : "argent",
            }))
          }

          const multicall = new Multicall(
            getProvider(network),
            network.multicallAddress,
          )

          const response = await Promise.all(
            accounts.map((acc) =>
              multicall.call(implementationCall(acc.address)),
            ),
          )
          console.log(
            "🚀 ~ file: fetchType.ts ~ line 92 ~ getAccountTypesFromChain ~ response",
            response,
          )

          const results: string[] = response.flat()
          console.log(
            "🚀 ~ file: fetchType.ts ~ line 95 ~ getAccountTypesFromChain ~ results",
            results,
          )

          return accounts.map(({ address }, i) => {
            const type = isEqualAddress(
              results[i],
              network.accountClassHash?.argentPluginAccount || "0x0",
            )
              ? "argent-plugin"
              : "argent"

            return {
              address,
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
