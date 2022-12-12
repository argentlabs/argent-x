import { Abi, Contract, ProviderInterface, number, stark } from "starknet"

import ArgentCompiledContractAbi from "../../../abis/ArgentAccount.json"
import ProxyCompiledContractAbi from "../../../abis/Proxy.json"
import { getMulticallForNetwork } from "../../../shared/multicall"
import { Network, getNetwork, getProvider } from "../../../shared/network"
import {
  ArgentAccountType,
  BaseWalletAccount,
  WalletAccount,
  WalletAccountSigner,
} from "../../../shared/wallet.model"
import { getAccountIdentifier } from "../../../shared/wallet.service"
import { createNewAccount } from "../../services/backgroundAccounts"

export interface AccountConstructorProps {
  address: string
  network: Network
  signer: WalletAccountSigner
  type: ArgentAccountType
  deployTransaction?: string
  hidden?: boolean
  needsDeploy?: boolean
  contract?: Contract
}

export class Account {
  address: string
  network: Network
  networkId: string
  signer: WalletAccountSigner
  type: ArgentAccountType
  deployTransaction?: string
  contract: Contract
  proxyContract: Contract
  provider: ProviderInterface
  hidden?: boolean
  needsDeploy?: boolean

  constructor({
    address,
    network,
    signer,
    type,
    deployTransaction,
    hidden,
    needsDeploy = false,
    contract,
  }: AccountConstructorProps) {
    this.address = address
    this.network = network
    this.networkId =
      network?.id /** network is sometimes undefined here in the wild */
    this.signer = signer
    this.hidden = hidden
    this.deployTransaction = deployTransaction
    this.needsDeploy = needsDeploy
    this.type = type
    this.provider = getProvider(network)
    this.contract =
      contract ??
      new Contract(ArgentCompiledContractAbi as Abi, address, this.provider)
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

  public async getCurrentImplementation(): Promise<string | undefined> {
    if (this.needsDeploy) {
      return this.network.accountClassHash?.argentAccount // cuz we always deploy regular accounts
    }

    const multicall = getMulticallForNetwork(this.network)
    const [implementation] = await multicall.call({
      contractAddress: this.address,
      entrypoint: "get_implementation",
    })

    return stark.makeAddress(number.toHex(number.toBN(implementation)))
  }

  public static async create(networkId: string): Promise<Account> {
    const result = await createNewAccount(networkId)
    if (result === "error") {
      throw new Error(result)
    }

    const network = await getNetwork(networkId)

    if (!network) {
      throw new Error(`Network ${networkId} not found`)
    }

    return new Account({
      address: result.account.address,
      network,
      signer: result.account.signer,
      type: result.account.type,
      needsDeploy: result.account.needsDeploy,
    })
  }

  public toWalletAccount(): WalletAccount {
    const { networkId, address, network, signer, type, needsDeploy } = this
    return {
      networkId,
      address,
      network,
      signer,
      type,
      needsDeploy,
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
