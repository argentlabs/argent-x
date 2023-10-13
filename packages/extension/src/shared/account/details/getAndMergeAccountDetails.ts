import { WalletAccount } from "../../wallet.model"
import { accountsEqual } from "../../utils/accountsEqual"
import { getAccountEscapeFromChain } from "./getAccountEscapeFromChain"
import { getAccountGuardiansFromChain } from "./getAccountGuardiansFromChain"
import { getAccountClassHashFromChain } from "./getAccountClassHashFromChain"
import { getAccountDeployStatusFromChain } from "./getAccountDeployStatusFromChain"
import { getAccountCairoVersionFromChain } from "./getAccountCairoVersionFromChain"

export type DetailFetchers =
  | typeof getAccountDeployStatusFromChain
  | typeof getAccountClassHashFromChain
  | typeof getAccountGuardiansFromChain
  | typeof getAccountEscapeFromChain
  | typeof getAccountCairoVersionFromChain

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
