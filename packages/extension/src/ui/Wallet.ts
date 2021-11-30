import ArgentCompiledContract from "!!raw-loader!../contracts/ArgentAccount.txt"
import { BigNumber, BigNumberish } from "@ethersproject/bignumber"
import {
  AddTransactionResponse,
  Args,
  Calldata,
  CompiledContract,
  Contract,
  Provider,
  compileCalldata,
  encode,
  hash,
  json,
  number,
  stark,
} from "starknet"

import { sendMessage, waitForMessage } from "../shared/messages"

const ArgentCompiledContractJson: CompiledContract = json.parse(
  ArgentCompiledContract,
)

export class Wallet {
  address: string
  deployTransaction?: string
  contract: Contract

  constructor(address: string, networkId: string, deployTransaction?: string) {
    this.address = address
    this.deployTransaction = deployTransaction
    this.contract = new Contract(
      ArgentCompiledContractJson.abi,
      address,
      new Provider({ network: networkId as any }),
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

  public async invoke(
    address: string,
    method: BigNumberish,
    args?: Args | Calldata,
  ): Promise<AddTransactionResponse> {
    let methodHex = ""
    try {
      if (typeof method === "string" && !number.isHex(method))
        throw Error("only hex strings allowed")
      methodHex = BigNumber.from(method).toHexString()
    } catch {}

    const selector = methodHex || stark.getSelectorFromName(method as string)
    const calldata = Array.isArray(args) ? args : compileCalldata(args || {})
    const nonce = await this.getCurrentNonce()
    const messageHash = encode.addHexPrefix(
      hash.hashMessage(this.address, address, selector, calldata, nonce),
    )

    sendMessage({ type: "SIGN", data: { hash: messageHash } })
    const { r, s } = await waitForMessage("SIGN_RES")

    return this.contract.invoke(
      "execute",
      {
        to: address,
        selector,
        calldata,
        nonce,
      },
      [r, s],
    )
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
