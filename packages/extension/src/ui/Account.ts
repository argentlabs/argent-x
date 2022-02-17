import ArgentCompiledContract from "!!raw-loader!../contracts/ArgentAccount.txt"
import { CompiledContract, Contract, json } from "starknet"

import { BackupWalletSigner } from "../shared/backup.model"
import { sendMessage, waitForMessage } from "../shared/messages"
import { getProvider } from "../shared/networks"

const ArgentCompiledContractJson: CompiledContract = json.parse(
  ArgentCompiledContract,
)

export class Account {
  address: string
  networkId: string
  signer: BackupWalletSigner
  deployTransaction?: string
  contract: Contract

  constructor(
    address: string,
    networkId: string,
    signer: BackupWalletSigner,
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
      result.wallet.signer,
      result.txHash,
    )
  }
}
