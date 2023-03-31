import { Abi, Contract, ProviderInterface, number, stark } from "starknet"

import ArgentCompiledContractAbi from "../../../abis/ArgentAccount.json"
import ProxyCompiledContractAbi from "../../../abis/Proxy.json"
import { Escape } from "../../../shared/account/details/getEscape"
import { getMulticallForNetwork } from "../../../shared/multicall"
import { Network, getNetwork, getProvider } from "../../../shared/network"
import {
  ArgentAccountType,
  BaseWalletAccount,
  CreateAccountType,
  WalletAccount,
  WalletAccountSigner,
} from "../../../shared/wallet.model"
import { getAccountIdentifier } from "../../../shared/wallet.service"
import { createNewAccount } from "../../services/backgroundAccounts"

export interface AccountConstructorProps {
  name: string
  address: string
  network: Network
  signer: WalletAccountSigner
  type: ArgentAccountType
  guardian?: string | undefined
  escape?: Escape
  deployTransaction?: string
  hidden?: boolean
  needsDeploy?: boolean
  contract?: Contract
}

export class Account {
  name: string
  address: string
  network: Network
  networkId: string
  signer: WalletAccountSigner
  type: ArgentAccountType
  guardian?: string | undefined
  escape?: Escape
  deployTransaction?: string
  contract: Contract
  proxyContract: Contract
  provider: ProviderInterface
  hidden?: boolean
  needsDeploy?: boolean

  constructor({
    name,
    address,
    network,
    signer,
    type,
    guardian,
    escape,
    deployTransaction,
    hidden,
    needsDeploy = false,
    contract,
  }: AccountConstructorProps) {
    this.name = name
    this.address = address
    this.network = network
    this.networkId =
      network?.id /** network is sometimes undefined here in the wild */
    this.signer = signer
    this.hidden = hidden
    this.deployTransaction = deployTransaction
    this.needsDeploy = needsDeploy
    this.type = type
    this.guardian = guardian
    this.escape = escape
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
      return this.network.accountClassHash?.[this.type] // We deploy Standard and Multisig accounts now
    }

    const multicall = getMulticallForNetwork(this.network)
    const [implementation] = await multicall.call({
      contractAddress: this.address,
      entrypoint: "get_implementation",
    })

    return stark.makeAddress(number.toHex(number.toBN(implementation)))
  }

  public static async create(
    networkId: string,
    type?: CreateAccountType,
  ): Promise<Account> {
    const result = await createNewAccount(networkId, type)
    if (result === "error") {
      throw new Error(result)
    }

    const network = await getNetwork(networkId)

    if (!network) {
      throw new Error(`Network ${networkId} not found`)
    }

    return new Account({
      name: result.account.name,
      address: result.account.address,
      network,
      signer: result.account.signer,
      type: result.account.type,
      guardian: result.account.guardian,
      escape: result.account.escape,
      needsDeploy: result.account.needsDeploy,
    })
  }

  public toWalletAccount(): WalletAccount {
    const {
      name,
      networkId,
      address,
      network,
      signer,
      type,
      guardian,
      escape,
      needsDeploy,
    } = this
    return {
      name,
      networkId,
      address,
      network,
      signer,
      type,
      guardian,
      escape,
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
