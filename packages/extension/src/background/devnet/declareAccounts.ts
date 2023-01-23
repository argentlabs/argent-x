import { getStarkKey } from "@noble/curves/stark"
import { memoize } from "lodash-es"
import { Account, AccountInterface } from "starknet"
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
    return new Account(
      provider,
      preDeployedAccount.address,
      preDeployedAccount.private_key,
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
    const proxy = await deployAccount.declare({
      classHash: PROXY_CONTRACT_CLASS_HASHES[0],
      contract: proxyContract,
    })

    const account = await deployAccount.declare({
      classHash: ARGENT_ACCOUNT_CONTRACT_CLASS_HASHES[0],
      contract: accountContract,
    })

    await deployAccount.waitForTransaction(account.transaction_hash, 1e3)
    await deployAccount.waitForTransaction(proxy.transaction_hash, 1e3)

    return { proxy, account }
  },
  (network) => `${network.baseUrl}`,
)
