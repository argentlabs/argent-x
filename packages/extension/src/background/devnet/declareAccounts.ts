import { Account, AccountInterface, ec } from "starknet"
import urlJoin from "url-join"

import { Network, getProvider } from "../../shared/network"
import { LoadContracts, loadContracts } from "../accounts"
import {
  ARGENT_ACCOUNT_CONTRACT_CLASS_HASHES,
  PROXY_CONTRACT_CLASS_HASHES,
} from "../wallet"

interface PreDeployedAccount {
  address: string
  private_key: string
}

export const tryToDeclareContracts = async (
  network: Network,
  _loadContracts = loadContracts,
) => {
  try {
    const provider = getProvider(network)
    const [preDeployedAccount] = await fetch(
      urlJoin(network.baseUrl, "predeployed_accounts"),
    ).then((x) => x.json() as Promise<PreDeployedAccount[]>)
    const keypair = ec.getKeyPair(preDeployedAccount.private_key)
    const deployerAccount = new Account(
      provider,
      preDeployedAccount.address,
      keypair,
    )
    await declareContracts(deployerAccount, _loadContracts)
  } catch (e) {
    console.warn("Failed to declare contracts", e)
  }
}

export const declareContracts = async (
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

  await deployAccount.waitForTransaction(
    account.transaction_hash,
    undefined,
    1e3,
  )
  await deployAccount.waitForTransaction(proxy.transaction_hash, undefined, 1e3)

  return { proxy, account }
}
