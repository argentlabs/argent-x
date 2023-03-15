import { memoize } from "lodash-es"
import { Account, AccountInterface, ec } from "starknet"
import { hash } from "starknet5"
import urlJoin from "url-join"

import { Network, getProvider } from "../../shared/network"
import { LoadContracts } from "../accounts"
import {
  ARGENT_ACCOUNT_CONTRACT_CLASS_HASHES,
  PROXY_CONTRACT_CLASS_HASHES,
} from "../wallet"

interface PreDeployedAccount {
  address: string
  private_key: string
}

export const getPreDeployedAccount = async (
  network: Network,
  index = 0,
): Promise<AccountInterface | null> => {
  try {
    const preDeployedAccounts = await fetch(
      urlJoin(network.baseUrl, "predeployed_accounts"),
    ).then((x) => x.json() as Promise<PreDeployedAccount[]>)

    const preDeployedAccount = preDeployedAccounts[index]
    if (!preDeployedAccount) {
      throw new Error(`No pre-deployed account with index ${index}`)
    }

    const provider = getProvider(network)
    const keypair = ec.getKeyPair(preDeployedAccount.private_key)
    return new Account(provider, preDeployedAccount.address, keypair)
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

      await deployAccount.waitForTransaction(proxy.transaction_hash, 1e3)

      proxyClassHash = proxy.class_hash
    }

    if (!isAccountClassDeclared) {
      const account = await deployAccount.declare({
        classHash: ARGENT_ACCOUNT_CONTRACT_CLASS_HASHES[0],
        contract: accountContract,
      })

      await deployAccount.waitForTransaction(account.transaction_hash, 1e3)

      accountClassHash = account.class_hash
    }

    return {
      proxyClassHash: proxyClassHash ?? computedProxyClassHash,
      accountClassHash: accountClassHash ?? computedAccountClassHash,
    }
  },
  (network) => `${network.baseUrl}`,
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
