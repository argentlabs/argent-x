import {
  BaseMultisigWalletAccount,
  MultisigWalletAccount,
  WalletAccount,
} from "./../wallet.model"
import { fetchMultisigAccountData } from "../multisig/multisig.service"
import { multisigBaseWalletStore } from "../multisig/store"
import { getMultisigAccounts } from "../multisig/utils/baseMultisig"
import { ARGENT_SHIELD_ENABLED } from "../shield/constants"
import { BaseWalletAccount } from "../wallet.model"
import { accountsEqual } from "../wallet.service"
import { getAccountEscapeFromChain } from "./details/getAccountEscapeFromChain"
import { getAccountGuardiansFromChain } from "./details/getAccountGuardiansFromChain"
import { getAccountTypesFromChain } from "./details/getAccountTypesFromChain"
import {
  DetailFetchers,
  getAndMergeAccountDetails,
} from "./details/getAndMergeAccountDetails"
import { accountService } from "./service"

type UpdateScope = "all" | "type" | "deploy" | "guardian"

// TODO: move into worker instead of calling it explicitly
export async function updateAccountDetails(
  scope: UpdateScope,
  accounts?: BaseWalletAccount[],
) {
  const allAccounts = await accountService.get((a) =>
    accounts ? accounts.some((a2) => accountsEqual(a, a2)) : true,
  )

  const accountDetailFetchers: DetailFetchers[] = []
  let newAccounts: WalletAccount[] = []

  // Update deploy status before fetching account details
  if (scope === "deploy" || scope === "all") {
    newAccounts = allAccounts.map((account) => ({
      ...account,
      needsDeploy: false,
    }))
  }

  if (scope === "type" || scope === "all") {
    accountDetailFetchers.push(getAccountTypesFromChain)
  }

  if (ARGENT_SHIELD_ENABLED) {
    if (scope === "guardian" || scope === "all") {
      accountDetailFetchers.push(getAccountGuardiansFromChain)
      accountDetailFetchers.push(getAccountEscapeFromChain)
    }
  }

  const deployedAccounts = allAccounts
    .concat(newAccounts)
    .filter((acc) => !acc.needsDeploy)

  // Only fetch account details for deployed accounts
  const newAccountsWithDetails = await getAndMergeAccountDetails(
    deployedAccounts,
    accountDetailFetchers,
  )

  await accountService.upsert(newAccountsWithDetails) // handles deduplication and updates
}

export async function updateMultisigAccountDetails(
  accounts?: BaseWalletAccount[],
) {
  const multisigAccounts = await getMultisigAccounts((a) =>
    accounts ? accounts.some((a2) => accountsEqual(a, a2)) : true,
  )

  const updater = async ({
    address,
    networkId,
    publicKey,
  }: MultisigWalletAccount): Promise<BaseMultisigWalletAccount> => {
    const { content } = await fetchMultisigAccountData({
      address,
      networkId,
    })

    return {
      ...content,
      address,
      networkId,
      publicKey,
    }
  }

  const updated = await Promise.all(multisigAccounts.map(updater))

  await multisigBaseWalletStore.push(updated) // handles deduplication and updates
}
