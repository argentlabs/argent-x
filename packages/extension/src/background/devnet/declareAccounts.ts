import { memoize } from "lodash-es"
import { Account, AccountInterface, hash } from "starknet"
import urlJoin from "url-join"

import { Network, getProvider } from "../../shared/network"
import { LoadContracts } from "../wallet/loadContracts"
import {
  ARGENT_ACCOUNT_CONTRACT_CLASS_HASHES,
  PROXY_CONTRACT_CLASS_HASHES,
} from "../wallet/starknet.constants"

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

export const declareContracts = memoize(
  async (
    _network: Network,
    deployAccount: AccountInterface,
    _loadContracts: LoadContracts,
  ) => {
    const [proxyContract, accountContract] = await _loadContracts()

    let proxyClassHash: string | undefined
    let accountClassHash: string | undefined

    const computedProxyClassHash = hash.computeContractClassHash(proxyContract)
    const computedAccountClassHash =
      hash.computeContractClassHash(accountContract)

    const isProxyClassDeclared = await checkIfClassIsDeclared(
      deployAccount,
      computedProxyClassHash,
    )

    const isAccountClassDeclared = await checkIfClassIsDeclared(
      deployAccount,
      computedAccountClassHash,
    )

    if (!isProxyClassDeclared) {
      const proxy = await deployAccount.declare({
        classHash: PROXY_CONTRACT_CLASS_HASHES[0],
        contract: proxyContract,
      })

      await deployAccount.waitForTransaction(proxy.transaction_hash, {
        retryInterval: 1e3,
      })

      proxyClassHash = proxy.class_hash
    }

    if (!isAccountClassDeclared) {
      const account = await deployAccount.declare({
        classHash: ARGENT_ACCOUNT_CONTRACT_CLASS_HASHES[0],
        contract: accountContract,
      })

      await deployAccount.waitForTransaction(account.transaction_hash, {
        retryInterval: 1e3,
      })

      accountClassHash = account.class_hash
    }

    return {
      proxyClassHash: proxyClassHash ?? computedProxyClassHash,
      accountClassHash: accountClassHash ?? computedAccountClassHash,
    }
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
