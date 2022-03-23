import ArgentCompiledContract from "!!raw-loader!../contracts/ArgentAccount.txt"
import ProxyCompiledContract from "!!raw-loader!../contracts/Proxy.txt"
import { CompiledContract, Contract, json, number, stark } from "starknet"

import { sendMessage, waitForMessage } from "../shared/messages"
import { getProvider } from "../shared/networks"
import { WalletAccountSigner } from "../shared/wallet.model"

const ArgentCompiledContractJson: CompiledContract = json.parse(
  ArgentCompiledContract,
)
const ProxyCompiledContractJson: CompiledContract = json.parse(
  ProxyCompiledContract,
)

export class Account {
  address: string
  networkId: string
  signer: WalletAccountSigner
  deployTransaction?: string
  contract: Contract
  proxyContract: Contract

  constructor(
    address: string,
    networkId: string,
    signer: WalletAccountSigner,
    deployTransaction?: string,
  ) {
    this.address = address
    this.networkId = networkId
    this.signer = signer
    this.deployTransaction = deployTransaction
    this.contract = new Contract(
      ArgentCompiledContractJson.abi,
      address,
      getProvider(networkId),
    )
    this.proxyContract = new Contract(
      ProxyCompiledContractJson.abi,
      address,
      getProvider(networkId),
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

    return new Account(
      result.address,
      networkId,
      result.account.signer,
      result.txHash,
    )
  }
}
