import memoize from "memoizee"
import type { AccountInterface, CairoAssembly } from "starknet"
import { Account, hash } from "starknet"
import urlJoin from "url-join"

import type { Network } from "../../shared/network"
import { getProvider } from "../../shared/network"
import type { LoadContracts } from "../wallet/loadContracts"

interface PreDeployedAccount {
  address: string
  private_key: string
}

export const getPreDeployedAccount = async (
  network: Network,
  index = 0,
): Promise<AccountInterface | null> => {
  try {
    const networkUrl = network.rpcUrl

    const preDeployedAccounts = await fetch(
      urlJoin(networkUrl, "predeployed_accounts"),
    ).then((x) => x.json() as Promise<PreDeployedAccount[]>)

    const preDeployedAccount = preDeployedAccounts[index]
    if (!preDeployedAccount) {
      throw new Error(`No pre-deployed account with index ${index}`)
    }

    const provider = getProvider(network)

    return new Account(
      provider,
      preDeployedAccount.address,
      preDeployedAccount.private_key,
      "1",
    )
  } catch (e) {
    console.warn(`Failed to get pre-deployed account: ${e}`)
    return null
  }
}

// Declare latest Cairo1 contract if not already declared
export const declareContracts = memoize(
  async (
    _network: Network,
    deployAccount: AccountInterface,
    _loadContracts: LoadContracts,
  ) => {
    const [accountContract, accountCasm] = await _loadContracts()
    let accountClassHash: string | undefined

    const computedAccountClassHash =
      hash.computeContractClassHash(accountContract)

    const parsedCasm = JSON.parse(accountCasm) as CairoAssembly

    const isAccountClassDeclared = await checkIfClassIsDeclared(
      deployAccount,
      computedAccountClassHash,
    )

    if (!isAccountClassDeclared) {
      const account = await deployAccount.declare({
        classHash: computedAccountClassHash,
        casm: parsedCasm,
        contract: accountContract,
      })

      await deployAccount.waitForTransaction(account.transaction_hash, {
        retryInterval: 1e3,
      })

      accountClassHash = account.class_hash
    }

    return accountClassHash ?? computedAccountClassHash
  },
  {
    promise: true,
    normalizer: ([network]) => `${network.rpcUrl}`,
  },
)

export const checkIfClassIsDeclared = async (
  account: AccountInterface,
  classHash: string,
) => {
  try {
    const contract = await account.getClassByHash(classHash)

    console.log("Contract already declared", classHash)
    return Boolean(contract)
  } catch {
    console.warn("Contract not declared", classHash)
    return false
  }
}
