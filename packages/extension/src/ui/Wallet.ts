import ArgentCompiledContract from "!!raw-loader!../contracts/ArgentAccount.txt"
import { BigNumber, BigNumberish } from "@ethersproject/bignumber"
import {
  AddTransactionResponse,
  Args,
  Calldata,
  CompiledContract,
  Contract,
  compileCalldata,
  encode,
  hash,
  json,
  number,
  stark,
} from "starknet"

import { sendMessage, waitForMessage } from "../shared/messages"
import { getProvider } from "../shared/networks"

const ArgentCompiledContractJson: CompiledContract = json.parse(
  ArgentCompiledContract,
)

export class Wallet {
  address: string
  networkId: string
  deployTransaction?: string
  contract: Contract

  constructor(address: string, networkId: string, deployTransaction?: string) {
    this.address = address
    this.deployTransaction = deployTransaction
    this.networkId = networkId
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
    const deployTransaction = await waitForMessage("NEW_ACCOUNT_RES")

    return new Wallet(
      deployTransaction.address,
      networkId,
      deployTransaction.txHash,
    )
  }
}
