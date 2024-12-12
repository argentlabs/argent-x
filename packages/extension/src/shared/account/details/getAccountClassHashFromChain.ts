import { flatten, groupBy, toPairs } from "lodash-es"
import type { Call } from "starknet"
import { num } from "starknet"

import { getMulticallForNetwork } from "../../multicall"
import { getProvider } from "../../network"
import { networkService } from "../../network/service"
import { mapImplementationToArgentAccountType } from "../../network/utils"
import type {
  AccountId,
  ArgentAccountType,
  ArgentWalletAccount,
  WalletAccount,
} from "../../wallet.model"
import { accountsEqual } from "../../utils/accountsEqual"
import {
  addressSchema,
  TXV1_ACCOUNT_CLASS_HASH,
  TXV1_MULTISIG_CLASS_HASH,
} from "@argent/x-shared"
import { tryGetClassHash } from "./tryGetClassHash"

export type AccountClassHashFromChain = Pick<
  ArgentWalletAccount,
  "id" | "address" | "networkId" | "type" | "classHash"
>

const getDefaultClassHash = (account: WalletAccount) => {
  if (account.network.accountClassHash?.[account.type]) {
    return account.network.accountClassHash?.[account.type]
  }
  if (account.type === "multisig") {
    return TXV1_MULTISIG_CLASS_HASH
  }
  return TXV1_ACCOUNT_CLASS_HASH
}

/**
 * Passing in a list of accounts, this function will return the account class hash and type for each account.
 * Type is included here because we determine the type based on the class hash
 * @param accounts WalletAccount[]
 * @returns AccountClassHashFromChain[]
 */
export async function getAccountClassHashFromChain(
  accounts: ArgentWalletAccount[],
): Promise<AccountClassHashFromChain[]> {
  const accountsByNetwork = toPairs(groupBy(accounts, (a) => a.networkId))

  const accountTypeCallsByNetwork = accountsByNetwork.map(
    ([network, as]) =>
      [
        network,
        as.map(
          (
            account,
          ): {
            id: AccountId
            classHash: string | undefined
            call: Call
            fallbackType: ArgentAccountType
          } => {
            return {
              id: account.id,
              classHash: account.classHash || getDefaultClassHash(account),
              call: {
                contractAddress: account.address,
                entrypoint: "get_implementation",
              },
              fallbackType: account.type,
            }
          },
        ),
      ] as const,
  )

  const updatedAccounts = flatten(
    await Promise.all(
      accountTypeCallsByNetwork.map(
        async ([networkId, classHashWithCalls]): Promise<
          Array<{
            id: AccountId
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
              const id = classHashWithCalls[i].id
              const call = classHashWithCalls[i].call
              const fallbackType = classHashWithCalls[i].fallbackType
              const type: ArgentAccountType =
                mapImplementationToArgentAccountType(
                  response,
                  network,
                  fallbackType,
                )
              return {
                id,
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
          return classHashWithCalls.map(({ call, fallbackType, id }, i) => ({
            id,
            address: call.contractAddress,
            networkId,
            classHash: results[i],
            type: mapImplementationToArgentAccountType(
              results[i],
              network,
              fallbackType,
            ),
          }))
        },
      ),
    ),
  )

  return accounts.map((account) => {
    const updatedAccount = updatedAccounts.find((x) =>
      accountsEqual(x, account),
    )
    const { address, networkId, id } = account
    const classHash = updatedAccount?.classHash || account.classHash
    const parsedClassHash = classHash
      ? addressSchema.parse(classHash)
      : undefined

    return {
      id,
      address,
      networkId,
      classHash: parsedClassHash,
      type: updatedAccount?.type || account.type || "argent",
    }
  })
}
