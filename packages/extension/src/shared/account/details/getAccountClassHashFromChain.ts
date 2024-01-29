import { flatten, groupBy, toPairs } from "lodash-es"
import { Call, num } from "starknet"

import { getMulticallForNetwork } from "../../multicall"
import { getProvider } from "../../network"
import { networkService } from "../../network/service"
import { mapImplementationToArgentAccountType } from "../../network/utils"
import { ArgentAccountType, WalletAccount } from "../../wallet.model"
import { accountsEqual } from "../../utils/accountsEqual"
import { addressSchema } from "@argent/shared"
import { tryGetClassHash } from "./tryGetClassHash"
import {
  MULTISIG_ACCOUNT_CLASS_HASH,
  STANDARD_ACCOUNT_CLASS_HASH,
} from "../../network/constants"

export type AccountClassHashFromChain = Pick<
  WalletAccount,
  "address" | "networkId" | "type" | "classHash"
>

const getDefaultClassHash = (account: WalletAccount) => {
  if (account.network.accountClassHash?.standard) {
    return account.network.accountClassHash?.standard
  }
  if (account.type === "multisig") {
    return MULTISIG_ACCOUNT_CLASS_HASH
  }
  return STANDARD_ACCOUNT_CLASS_HASH
}

/**
 * Passing in a list of accounts, this function will return the account class hash and type for each account.
 * Type is included here because we determine the type based on the class hash
 * @param accounts WalletAccount[]
 * @returns AccountClassHashFromChain[]
 */
export async function getAccountClassHashFromChain(
  accounts: WalletAccount[],
): Promise<AccountClassHashFromChain[]> {
  const accountsByNetwork = toPairs(groupBy(accounts, (a) => a.networkId))

  const accountTypeCallsByNetwork = accountsByNetwork.map(
    ([network, as]) =>
      [
        network,
        as.map((account): { classHash: string | undefined; call: Call } => {
          return {
            classHash: account.classHash || getDefaultClassHash(account),
            call: {
              contractAddress: account.address,
              entrypoint: "get_implementation",
            },
          }
        }),
      ] as const,
  )

  const updatedAccounts = flatten(
    await Promise.all(
      accountTypeCallsByNetwork.map(
        async ([networkId, classHashWithCalls]): Promise<
          Array<{
            address: string
            networkId: string
            type: ArgentAccountType
            classHash: string
          }>
        > => {
          const network = await networkService.getById(networkId)
          const provider = getProvider(network)

          if (network.multicallAddress) {
            const multicall = getMulticallForNetwork(network)

            const responses = await Promise.all(
              classHashWithCalls.map(({ classHash, call }) => {
                return tryGetClassHash(
                  call,
                  {
                    callContract: multicall.callContract.bind(multicall),
                    getClassHashAt: provider.getClassHashAt.bind(provider),
                  },
                  classHash,
                )
              }),
            )

            const result = responses.map((response, i) => {
              const call = classHashWithCalls[i].call
              const type: ArgentAccountType =
                mapImplementationToArgentAccountType(response, network)
              return {
                address: call.contractAddress,
                networkId,
                classHash: response,
                type,
              }
            })
            return result
          }
          /** fallback to single calls */
          const responses = await Promise.all(
            classHashWithCalls.map(({ classHash, call }) =>
              tryGetClassHash(call, provider, classHash),
            ),
          )
          const results: string[] = responses.map((res) => num.toHex(res))
          return classHashWithCalls.map(({ call }, i) => ({
            address: call.contractAddress,
            networkId,
            classHash: results[i],
            type: mapImplementationToArgentAccountType(results[i], network),
          }))
        },
      ),
    ),
  )

  return accounts.map((account) => {
    const updatedAccount = updatedAccounts.find((x) =>
      accountsEqual(x, account),
    )
    const { address, networkId } = account
    const classHash = updatedAccount?.classHash || account.classHash
    const parsedClassHash = classHash
      ? addressSchema.parse(classHash)
      : undefined

    return {
      address,
      networkId,
      classHash: parsedClassHash,
      type: updatedAccount?.type || account.type || "argent",
    }
  })
}
