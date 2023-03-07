import {
  Abi,
  Account,
  AllowArray,
  Call,
  InvocationsDetails,
  InvocationsSignerDetails,
  KeyPair,
  ProviderInterface,
  ProviderOptions,
  constants,
  hash,
  number,
} from "starknet"
import urlJoin from "url-join"

import { ARGENT_MULTISIG_URL } from "../api/constants"
import { fetcher } from "../api/fetcher"
import { chainIdToStarknetNetwork } from "../utils/starknetNetwork"
import {
  ApiMultisigAddRequestSignatureSchema,
  ApiMultisigPostRequestTxnSchema,
  ApiMultisigTransaction,
  ApiMultisigTxnResponseSchema,
  MultisigInvokeResponse,
} from "./multisig.model"
import { MultisigSigner } from "./signer"

const ZERO_HASH = number.toHex(constants.ZERO)

export class MultisigAccount extends Account {
  constructor(
    providerOrOptions: ProviderInterface | ProviderOptions,
    address: string,
    keyPairOrSigner: MultisigSigner | KeyPair,
  ) {
    const multisigSigner =
      "getPubKey" in keyPairOrSigner
        ? keyPairOrSigner
        : new MultisigSigner(keyPairOrSigner)
    super(providerOrOptions, address, multisigSigner)
  }

  static fromAccount(account: Account): MultisigAccount {
    return new MultisigAccount(account, account.address, account.signer)
  }

  public async execute(
    calls: AllowArray<Call>,
    abis?: Abi[] | undefined,
    transactionsDetail: InvocationsDetails = {},
  ): Promise<MultisigInvokeResponse> {
    if (!ARGENT_MULTISIG_URL) {
      throw "Argent Multisig endpoint is not defined"
    }

    const transactions = Array.isArray(calls) ? calls : [calls]
    const nonce = number
      .toBN(transactionsDetail.nonce ?? (await this.getNonce()))
      .toString()
    const version = number.toBN(hash.transactionVersion).toString()
    const chainId = await this.getChainId()

    const maxFee = transactionsDetail.maxFee ?? constants.ZERO // TODO: implement estimateFee

    const signerDetails: InvocationsSignerDetails = {
      walletAddress: this.address,
      chainId,
      nonce,
      version,
      maxFee,
    }

    const [creator, r, s] = await this.signer.signTransaction(
      transactions,
      signerDetails,
      abis,
    )

    const starknetNetwork = chainIdToStarknetNetwork(chainId)

    const txnWithHexCalldata = transactions.map((transaction) => ({
      ...transaction,
      calldata: number.getHexStringArray(transaction.calldata ?? []),
    }))

    const request = ApiMultisigPostRequestTxnSchema.parse({
      creator,
      transaction: {
        nonce: number.toHex(nonce),
        version: number.toHex(version),
        maxFee: maxFee.toString(),
        calls: txnWithHexCalldata,
      },
      starknetSignature: { r, s },
    })

    const url = urlJoin(
      ARGENT_MULTISIG_URL,
      starknetNetwork,
      this.address,
      "request",
    )

    const response = await fetcher(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    })
    const data = ApiMultisigTxnResponseSchema.parse(response)

    return {
      requestId: data.content.id,
      // Should ignore transactionHash till it's available. We do this because
      // the transactionHash is not available till every owner has signed the transaction.
      transaction_hash: data.content.transactionHash ?? ZERO_HASH,
      creator: data.content.creator,
    }
  }

  public async addRequestSignature(
    requestId: string,
    transaction: ApiMultisigTransaction,
  ) {
    if (!ARGENT_MULTISIG_URL) {
      throw "Argent Multisig endpoint is not defined"
    }

    const chainId = await this.getChainId()
    const starknetNetwork = chainIdToStarknetNetwork(chainId)

    const { calls, maxFee, nonce, version } = transaction

    const signerDetails: InvocationsSignerDetails = {
      walletAddress: this.address,
      chainId,
      nonce,
      version,
      maxFee,
    }

    const [signer, r, s] = await this.signer.signTransaction(
      calls,
      signerDetails,
    )

    const url = urlJoin(
      ARGENT_MULTISIG_URL,
      starknetNetwork,
      this.address,
      "request",
      requestId,
      "signature",
    )

    const request = ApiMultisigAddRequestSignatureSchema.parse({
      signer,
      starknetSignature: { r, s },
    })

    const response = await fetcher(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    })

    return ApiMultisigTxnResponseSchema.parse(response)
  }
}
