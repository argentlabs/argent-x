import ArgentCompiledContract from "!!raw-loader!../contracts/ArgentAccount.txt"
import { CompiledContract, Contract, json } from "starknet"

import { BackupWalletSigner } from "../shared/backup.model"
import { sendMessage, waitForMessage } from "../shared/messages"
import { getProvider } from "../shared/networks"

const ArgentCompiledContractJson: CompiledContract = json.parse(
  ArgentCompiledContract,
)

export class Wallet {
  address: string
  networkId: string
  deployTransaction?: string
  signer: BackupWalletSigner
  contract: Contract

  constructor(
    address: string,
    networkId: string,
    signer: BackupWalletSigner,
    deployTransaction?: string,
  ) {
    this.address = address
    this.deployTransaction = deployTransaction
    this.networkId = networkId
    this.signer = signer
    this.contract = new Contract(
      ArgentCompiledContractJson.abi,
      address,
      getProvider(networkId),
    )

    if (deployTransaction) {
      localStorage.setItem(`walletTx:${address}`, deployTransaction)
    } else if (localStorage.getItem(`walletTx:${address}`)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.deployTransaction = localStorage.getItem(`walletTx:${address}`)!
    }
  }

  public completeDeployTx(): void {
    localStorage.removeItem(`walletTx:${this.address}`)
    this.deployTransaction = undefined
  }

  public async getCurrentNonce(): Promise<string> {
    const { nonce } = await this.contract.call("get_nonce")
    return nonce.toString()
  }

  public static async fromDeploy(networkId: string): Promise<Wallet> {
    sendMessage({ type: "NEW_ACCOUNT", data: networkId })

    const result = await Promise.race([
      waitForMessage("NEW_ACCOUNT_RES"),
      waitForMessage("NEW_ACCOUNT_REJ"),
    ])

    if (result.status === "ko") {
      throw new Error(result.error)
    }

    return new Wallet(
      result.address,
      networkId,
      result.wallet.signer,
      result.txHash,
    )
  }
}
