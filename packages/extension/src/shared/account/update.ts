import { accountsEqual, accountsEqualByChainId } from "../utils/accountsEqual"
import { BaseMultisigWalletAccount, WalletAccount } from "./../wallet.model"
import { getMultisigAccounts } from "../multisig/utils/baseMultisig"
import { BaseWalletAccount } from "../wallet.model"
import { getAccountEscapeFromChain } from "./details/getAccountEscapeFromChain"
import { getAccountGuardiansFromChain } from "./details/getAccountGuardiansFromChain"
import { getAccountClassHashFromChain } from "./details/getAccountClassHashFromChain"
import {
  DetailFetchers,
  getAndMergeAccountDetails,
} from "./details/getAndMergeAccountDetails"
import { accountService } from "./service"
import { multisigBaseWalletRepo } from "../multisig/repository"
import { Multicall } from "@argent/x-multicall"
import { getProvider } from "../network"
import { networkService } from "../network/service"
import { MultisigEntryPointType } from "../multisig/types"
import { getAccountCairoVersionFromChain } from "./details/getAccountCairoVersionFromChain"

type UpdateScope = "all" | "implementation" | "deploy" | "guardian"

// TODO: move into worker instead of calling it explicitly
export async function updateAccountDetails(
  scope: UpdateScope,
  accounts?: WalletAccount[],
) {
  const allAccounts = await accountService.get((a) =>
    accounts ? accounts.some((a2) => accountsEqualByChainId(a, a2)) : true,
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

  if (scope === "implementation" || scope === "all") {
    accountDetailFetchers.push(getAccountClassHashFromChain)
    accountDetailFetchers.push(getAccountCairoVersionFromChain)
  }

  if (scope === "guardian" || scope === "all") {
    accountDetailFetchers.push(getAccountGuardiansFromChain)
    accountDetailFetchers.push(getAccountEscapeFromChain)
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

  const updatedAccounts = await accountService.get((a) =>
    newAccountsWithDetails.some((a2) => accountsEqual(a, a2)),
  )

  return updatedAccounts
}

export async function updateMultisigAccountDetails(
  accounts?: BaseWalletAccount[],
) {
  const multisigAccounts = await getMultisigAccounts((a) =>
    accounts ? accounts.some((a2) => accountsEqual(a, a2)) : true,
  )

  const entrypoints = [
    MultisigEntryPointType.GET_SIGNERS,
    MultisigEntryPointType.GET_THRESHOLD,
  ]

  const promises: Promise<BaseMultisigWalletAccount>[] = multisigAccounts.map(
    async (multisigAccount) => {
      const [signers, threshold] = await Promise.all(
        entrypoints.map(async (entrypoint) => {
          const { address, networkId } = multisigAccount
          const network = await networkService.getById(networkId)
          const provider = getProvider(network)
          const multicall = new Multicall(provider, network.multicallAddress)
          return multicall.call({
            contractAddress: address,
            entrypoint,
          })
        }),
      )
      return {
        ...multisigAccount,
        signers: signers.slice(1), // remove first element which is the length of the signers array. eg: ["0x2", "0x123", "0x456"]
        threshold: parseInt(threshold[0], 16),
        updatedAt: Date.now(),
      }
    },
  )

  const updated = await Promise.all(promises)

  await multisigBaseWalletRepo.upsert(updated) // handles deduplication and updates
}
