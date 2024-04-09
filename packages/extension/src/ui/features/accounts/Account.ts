import { Abi, CairoVersion, Contract, ProviderInterface } from "starknet"

import ArgentCompiledContractAbi from "../../../abis/ArgentAccount.json"
import ProxyCompiledContractAbi from "../../../abis/Proxy.json"
import { Escape } from "../../../shared/account/details/escape.model"
import { Network, getProvider } from "../../../shared/network"
import { networkService } from "../../../shared/network/service"
import {
  ArgentAccountType,
  BaseWalletAccount,
  CreateAccountType,
  WalletAccount,
  WalletAccountSigner,
} from "../../../shared/wallet.model"
import { getAccountIdentifier } from "../../../shared/wallet.service"
import { clientAccountService } from "../../services/account"
import { Address } from "@argent/x-shared"

export interface AccountConstructorProps {
  name: string
  address: string
  network: Network
  signer: WalletAccountSigner
  type: ArgentAccountType
  classHash?: Address
  cairoVersion?: CairoVersion
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
  classHash?: Address
  cairoVersion?: CairoVersion
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
    classHash,
    guardian,
    cairoVersion,
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
    this.classHash = classHash
    this.cairoVersion = cairoVersion
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

  public getCurrentImplementation(): string | undefined {
    if (this.needsDeploy) {
      return this.network.accountClassHash?.[this.type] // We deploy Standard and Multisig accounts now
    }

    return this.classHash
  }

  public static async create(
    networkId: string,
    type: CreateAccountType = "standard",
  ): Promise<Account> {
    const account = await clientAccountService.create(type, networkId)
    const network = await networkService.getById(networkId)

    if (!network) {
      throw new Error(`Network ${networkId} not found`)
    }

    return new Account({
      name: account.name,
      address: account.address,
      network,
      signer: account.signer,
      type: account.type,
      guardian: account.guardian,
      escape: account.escape,
      needsDeploy: account.needsDeploy,
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
      classHash,
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
      classHash,
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
