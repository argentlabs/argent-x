import { memoize } from "lodash-es"
import { Account, AccountInterface, CairoAssembly, hash } from "starknet"
import urlJoin from "url-join"

import { Network, getProvider } from "../../shared/network"
import { LoadContracts } from "../wallet/loadContracts"
import { cairoAssemblySchema } from "@argent/x-shared"

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
      "0", // Devnet is currently supporting only cairo 0
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
  (network) => `${network.rpcUrl}`,
)

export const checkIfClassIsDeclared = async (
  account: AccountInterface,
  classHash: string,
) => {
  try {
    const contract = await account.getClassByHash(classHash)

    console.log("Contract already declared", classHash)
    return Boolean(contract)
  } catch (error) {
    console.warn("Contract not declared", classHash)
    return false
  }
}
