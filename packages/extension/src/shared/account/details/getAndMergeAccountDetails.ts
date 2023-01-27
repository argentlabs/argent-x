import { WalletAccount } from "../../wallet.model"
import { accountsEqual } from "../../wallet.service"
import { getAccountGuardiansFromChain } from "./getAccountGuardiansFromChain"
import { getAccountTypesFromChain } from "./getAccountTypesFromChain"

export type DetailFetchers =
  | typeof getAccountTypesFromChain
  | typeof getAccountGuardiansFromChain

/** Use Promise.all allows multicall to batch all calls to get account deatils on chain */

export const getAndMergeAccountDetails = async (
  accounts: WalletAccount[],
  detailFetchers: DetailFetchers[],
) => {
  const accountsWithAttributesResults = await Promise.all(
    detailFetchers.map((detailFetcher) => detailFetcher(accounts)),
  )

  /** merge accounts and attributes */
  const accountsWithAttributes = accounts.map((account) => {
    accountsWithAttributesResults.forEach((accountsWithAttributes) => {
      accountsWithAttributes.forEach((accountWithAttributes) => {
        if (accountsEqual(accountWithAttributes, account)) {
          account = {
            ...account,
            ...accountWithAttributes,
          }
        }
      })
    })
    return account
  })

  return accountsWithAttributes
}
