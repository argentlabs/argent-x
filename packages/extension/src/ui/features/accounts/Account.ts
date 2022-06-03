import { Abi, Contract, ProviderInterface, number, stark } from "starknet"

import ArgentCompiledContractAbi from "../../../abis/ArgentAccount.json"
import ProxyCompiledContractAbi from "../../../abis/Proxy.json"
import { sendMessage, waitForMessage } from "../../../shared/messages"
import { Network, getProvider } from "../../../shared/networks"
import { WalletAccountSigner } from "../../../shared/wallet.model"
import { getNetwork } from "../../services/backgroundNetworks"

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

    const key = `deployTransaction:${address}`
    if (deployTransaction) {
      localStorage.setItem(key, deployTransaction)
    } else if (localStorage.getItem(key)) {
      this.deployTransaction = localStorage.getItem(key) ?? undefined
    }
  }

  public completeDeployTx(): void {
    localStorage.removeItem(`deployTransaction:${this.address}`)
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
    sendMessage({ type: "NEW_ACCOUNT", data: networkId })

    const result = await Promise.race([
      waitForMessage("NEW_ACCOUNT_RES"),
      waitForMessage("NEW_ACCOUNT_REJ"),
    ])

    if (result.status === "ko") {
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
}
