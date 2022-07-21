import { Abi, Contract, ProviderInterface, number, stark } from "starknet"

import ArgentCompiledContractAbi from "../../../abis/ArgentAccount.json"
import ProxyCompiledContractAbi from "../../../abis/Proxy.json"
import { Network, getNetwork, getProvider } from "../../../shared/network"
import {
  BaseWalletAccount,
  WalletAccount,
  WalletAccountSigner,
} from "../../../shared/wallet.model"
import { getAccountIdentifier } from "../../../shared/wallet.service"
import { createNewAccount } from "../../services/backgroundAccounts"

export class Account {
  address: string
  network: Network
  networkId: string
  signer: WalletAccountSigner
  deployTransaction?: string
  contract: Contract
  proxyContract: Contract
  provider: ProviderInterface

  constructor(
    address: string,
    network: Network,
    signer: WalletAccountSigner,
    deployTransaction?: string,
  ) {
    this.address = address
    this.network = network
    this.networkId = network.id
    this.signer = signer
    this.deployTransaction = deployTransaction
    this.provider = getProvider(network)
    this.contract = new Contract(
      ArgentCompiledContractAbi as Abi,
      address,
      this.provider,
    )
    this.proxyContract = new Contract(
      ProxyCompiledContractAbi as Abi,
      address,
      this.provider,
    )

    const key = this.getDeployTransactionStorageKey()
    if (deployTransaction) {
      localStorage.setItem(key, deployTransaction)
    } else if (localStorage.getItem(key)) {
      this.deployTransaction = localStorage.getItem(key) ?? undefined
    }
  }

  public getDeployTransactionStorageKey(): string {
    const key = `deployTransaction:${getAccountIdentifier(this)}`
    return key
  }

  public updateDeployTx(deployTransaction: string) {
    const key = this.getDeployTransactionStorageKey()
    this.deployTransaction = deployTransaction
    localStorage.setItem(key, deployTransaction)
  }

  public completeDeployTx(): void {
    const key = this.getDeployTransactionStorageKey()
    localStorage.removeItem(key)
    this.deployTransaction = undefined
  }

  public async getCurrentNonce(): Promise<string> {
    const { nonce } = await this.contract.call("get_nonce")
    return nonce.toString()
  }

  public async getCurrentImplementation(): Promise<string> {
    const { implementation } = await this.proxyContract.call(
      "get_implementation",
    )
    return stark.makeAddress(number.toHex(implementation))
  }

  public static async fromDeploy(networkId: string): Promise<Account> {
    const result = await createNewAccount(networkId)
    if ("error" in result) {
      throw new Error(result.error)
    }

    const network = await getNetwork(networkId)

    if (!network) {
      throw new Error(`Network ${networkId} not found`)
    }

    return new Account(
      result.address,
      network,
      result.account.signer,
      result.txHash,
    )
  }

  public toWalletAccount(): WalletAccount {
    const { networkId, address, network, signer } = this
    return {
      networkId,
      address,
      network,
      signer,
    }
  }

  public toBaseWalletAccount(): BaseWalletAccount {
    const { networkId, address } = this
    return {
      networkId,
      address,
    }
  }
}
