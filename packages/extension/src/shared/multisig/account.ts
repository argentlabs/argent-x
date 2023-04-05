import {
  Abi,
  Account,
  AllowArray,
  Call,
  InvocationsDetails,
  InvocationsSignerDetails,
  InvokeFunctionResponse,
  KeyPair,
  ProviderInterface,
  ProviderOptions,
  hash,
  number,
  transaction,
} from "starknet"
import urlJoin from "url-join"

import { ARGENT_MULTISIG_URL } from "../api/constants"
import { fetcher } from "../api/fetcher"
import {
  chainIdToStarknetNetwork,
  starknetNetworkToNetworkId,
} from "../utils/starknetNetwork"
import {
  ApiMultisigAddRequestSignatureSchema,
  ApiMultisigPostRequestTxnSchema,
  ApiMultisigTransaction,
  ApiMultisigTxnResponseSchema,
} from "./multisig.model"
import { addToMultisigPendingTransactions } from "./pendingTransactionsStore"
import { MultisigSigner } from "./signer"

export class MultisigAccount extends Account {
  public readonly multsigBaseUrl?: string

  constructor(
    providerOrOptions: ProviderInterface | ProviderOptions,
    address: string,
    keyPairOrSigner: MultisigSigner | KeyPair,
    multisigBaseUrl?: string,
  ) {
    const multisigSigner =
      "getPubKey" in keyPairOrSigner
        ? keyPairOrSigner
        : new MultisigSigner(keyPairOrSigner)
    super(providerOrOptions, address, multisigSigner)
    this.multsigBaseUrl = multisigBaseUrl ?? ARGENT_MULTISIG_URL
  }

  static fromAccount(account: Account, baseUrl?: string): MultisigAccount {
    return new MultisigAccount(
      account,
      account.address,
      account.signer,
      baseUrl,
    )
  }

  public async execute(
    calls: AllowArray<Call>,
    abis?: Abi[] | undefined,
    transactionsDetail: InvocationsDetails = {},
  ): Promise<InvokeFunctionResponse> {
    if (!this.multsigBaseUrl) {
      throw Error("Argent Multisig endpoint is not defined")
    }

    const transactions = Array.isArray(calls) ? calls : [calls]
    const nonce = number.toHex(
      number.toBN(transactionsDetail.nonce ?? (await this.getNonce())),
    )
    const version = number.toBN(hash.transactionVersion).toString()
    const chainId = await this.getChainId()

    const maxFee = transactionsDetail.maxFee ?? "0x77d87d677d1a0" // TODO: implement estimateFee (also cant be 0)

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
        nonce: number.toHexString(nonce),
        version: number.toHexString(version),
        // todo remove once we have 0.11
        maxFee: number.toHexString(maxFee),
        calls: txnWithHexCalldata,
      },
      starknetSignature: { r, s },
      signature: { r, s },
    })

    const url = urlJoin(
      this.multsigBaseUrl,
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

    const computedTransactionHash = hash.calculateTransactionHash(
      this.address,
      version,
      transaction.fromCallsToExecuteCalldata(transactions),
      maxFee,
      chainId,
      nonce,
    )

    const transactionHash =
      data.content.transactionHash ?? computedTransactionHash

    await addToMultisigPendingTransactions({
      ...data.content,
      requestId: data.content.id,
      timestamp: Date.now(),
      type: "INVOKE_FUNCTION",
      address: this.address,
      networkId: starknetNetworkToNetworkId(starknetNetwork),
      transactionHash,
    })

    return {
      transaction_hash: transactionHash,
    }
  }

  public async addRequestSignature(
    requestId: string,
    transaction: ApiMultisigTransaction,
  ) {
    if (!this.multsigBaseUrl) {
      throw Error("Argent Multisig endpoint is not defined")
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
      this.multsigBaseUrl,
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
