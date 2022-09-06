import LedgerStark from "@ledgerhq/hw-app-starknet"
import type Transport from "@ledgerhq/hw-transport"
import {
  Abi,
  Invocation,
  InvocationsSignerDetails,
  Signature,
  SignerInterface,
  encode,
  hash,
  transaction,
  typedData,
} from "starknet"

import { getPublicKeys } from "./utils"

class LedgerSigner implements SignerInterface {
  public derivationPath: string

  private ledger: LedgerStark

  constructor(derivationPath: string, transport: Transport) {
    this.derivationPath = derivationPath
    this.ledger = new LedgerStark(transport)
  }

  async getPubKey(): Promise<string> {
    const [response] = await getPublicKeys(this.ledger, [this.derivationPath])
    return response
  }
  /**
   * Sign a Starknet transaction
   *
   * @param {Invocation[]}  transactions - arrays of transactions to be signed
   * @param {InvocationsSignerDetails} transactionsDetail - addtional information about transactions
   * @returns {signature} the tx signature
   */
  public async signTransaction(
    transactions: Invocation[],
    transactionsDetail: InvocationsSignerDetails,
    abis?: Abi[],
  ): Promise<Signature> {
    if (abis && abis.length !== transactions.length) {
      throw new Error(
        "ABI must be provided for each transaction or no transaction",
      )
    }

    // now use abi to display decoded data somewhere

    const calldata = transaction.fromCallsToExecuteCalldataWithNonce(
      transactions,
      transactionsDetail.nonce,
    )

    const msgHash = hash.calculcateTransactionHash(
      transactionsDetail.walletAddress,
      transactionsDetail.version,
      hash.getSelectorFromName("__execute__"),
      calldata,
      transactionsDetail.maxFee,
      transactionsDetail.chainId,
    )

    const signature = await this.sign(msgHash)

    return signature
  }

  /**
   * Sign a typed data with the private key set by derivation path
   *
   * @param {typedData.TypedData}  data - data to be signed
   * @param {string} accountAddress - account address
   * @returns {signature} the msg signature
   */
  public async signMessage(
    data: typedData.TypedData,
    accountAddress: string,
  ): Promise<Signature> {
    const msgHash = typedData.getMessageHash(data, accountAddress)

    const signature = await this.sign(msgHash)

    return signature
  }

  private async sign(msg: string): Promise<Signature> {
    const response = await this.ledger.signFelt(this.derivationPath, msg, true)
    if (response.errorMessage) {
      throw new Error(response.errorMessage)
    }
    return [
      encode.addHexPrefix(encode.buf2hex(response.r)),
      encode.addHexPrefix(encode.buf2hex(response.s)),
    ]
  }
}

export default LedgerSigner
