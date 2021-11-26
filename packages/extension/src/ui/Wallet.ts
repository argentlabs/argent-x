import ArgentCompiledContract from "!!raw-loader!../contracts/ArgentAccount.txt"
import { BigNumber, BigNumberish } from "@ethersproject/bignumber"
import {
  AddTransactionResponse,
  Args,
  Calldata,
  CompiledContract,
  Contract,
  compileCalldata,
  ec,
  encode,
  hash,
  json,
  number,
  stark,
} from "starknet"

import { messenger } from "./utils/messaging"

const ArgentCompiledContractJson: CompiledContract = json.parse(
  ArgentCompiledContract,
)

export class Wallet {
  address: string
  deployTransaction?: string
  contract: Contract

  constructor(address: string, deployTransaction?: string) {
    this.address = address
    this.deployTransaction = deployTransaction
    this.contract = new Contract(ArgentCompiledContractJson.abi, address)

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

    messenger.emit("SIGN", { hash: messageHash })
    const { r, s } = await messenger.waitForEvent(
      "SIGN_RES",
      5 * 60 * 60 * 1000,
    )

    console.log(r, s)

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

  public static async fromDeploy(): Promise<Wallet> {
    messenger.emit("NEW_ACCOUNT", undefined)
    const deployTransaction = await messenger.waitForEvent(
      "NEW_ACCOUNT_RES",
      5 * 60 * 60 * 1000,
    )

    return new Wallet(deployTransaction.address, deployTransaction.txHash)
  }
}
