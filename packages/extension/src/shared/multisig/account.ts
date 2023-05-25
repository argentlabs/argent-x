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
  transaction as starknetTransaction,
} from "starknet"
import { Account as AccountV4 } from "starknet4"
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
  ApiMultisigTxnResponseSchema,
} from "./multisig.model"
import {
  addToMultisigPendingTransactions,
  cancelPendingMultisigTransactions,
  getMultisigPendingTransaction,
  multisigPendingTransactionToTransaction,
} from "./pendingTransactionsStore"
import { MultisigSigner } from "./signer"
import { getMultisigAccountFromBaseWallet } from "./utils/baseMultisig"

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

  static isMultisig(account: Account | AccountV4): account is MultisigAccount {
    return "multsigBaseUrl" in account && "addRequestSignature" in account
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

    const signature = await this.signer.signTransaction(
      transactions,
      signerDetails,
      abis,
    )

    const [creator, r, s] = signature.map(number.toHexString)

    const starknetNetwork = chainIdToStarknetNetwork(chainId)
    const networkId = starknetNetworkToNetworkId(starknetNetwork)

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
      starknetTransaction.fromCallsToExecuteCalldata(transactions),
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
      networkId,
      transactionHash,
      notify: false, // Don't notify the creator of the transaction
    })

    return {
      transaction_hash: transactionHash,
    }
  }

  public async addRequestSignature(requestId: string) {
    if (!this.multsigBaseUrl) {
      throw Error("Argent Multisig endpoint is not defined")
    }

    const chainId = await this.getChainId()
    const starknetNetwork = chainIdToStarknetNetwork(chainId)
    const networkId = starknetNetworkToNetworkId(starknetNetwork)

    const pendingTransaction = await getMultisigPendingTransaction(requestId)
    const multisig = await getMultisigAccountFromBaseWallet({
      address: this.address,
      networkId,
    })

    if (!multisig) {
      throw Error(`Multisig wallet with address ${this.address} not found`)
    }

    if (!pendingTransaction) {
      throw Error(
        `Pending Multisig transaction with requestId ${requestId} not found`,
      )
    }

    const { calls, maxFee, nonce, version } = pendingTransaction.transaction

    const signerDetails: InvocationsSignerDetails = {
      walletAddress: this.address,
      chainId,
      nonce,
      version,
      maxFee,
    }

    const signature = await this.signer.signTransaction(calls, signerDetails)

    const [signer, r, s] = signature.map(number.toHexString)

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

    const data = ApiMultisigTxnResponseSchema.parse(response)

    if (data.content.approvedSigners.length === multisig.threshold) {
      await multisigPendingTransactionToTransaction(
        data.content.id,
        data.content.state,
      )

      await cancelPendingMultisigTransactions({
        address: this.address,
        networkId,
      })
    } else {
      await addToMultisigPendingTransactions({
        ...pendingTransaction,
        approvedSigners: data.content.approvedSigners,
        nonApprovedSigners: data.content.nonApprovedSigners,
        state: data.content.state,
        notify: false,
      })
    }

    return {
      transaction_hash: pendingTransaction.transactionHash,
    }
  }
}
