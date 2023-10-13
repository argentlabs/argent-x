import urlJoin from "url-join"
import { fetcher } from "../../../api/fetcher"
import {
  chainIdToStarknetNetwork,
  networkIdToStarknetNetwork,
  networkToStarknetNetwork,
  starknetNetworkToNetworkId,
} from "../../../utils/starknetNetwork"
import { urlWithQuery } from "../../../utils/url"
import { BaseWalletAccount } from "../../../wallet.model"
import {
  ApiMultisigAccountData,
  ApiMultisigAccountDataSchema,
  ApiMultisigAddRequestSignatureSchema,
  ApiMultisigDataForSigner,
  ApiMultisigDataForSignerSchema,
  ApiMultisigGetRequests,
  ApiMultisigGetRequestsSchema,
  ApiMultisigPostRequestTxnSchema,
  ApiMultisigTxnResponseSchema,
} from "../../multisig.model"
import { IMultisigBackendService } from "./interface"
import {
  IAddNewTransaction,
  IAddRequestSignature,
  IFetchMultisigDataForSigner,
} from "./types"
import { getMultisigAccountFromBaseWallet } from "../../utils/baseMultisig"
import { InvokeFunctionResponse, hash, num, stark, transaction } from "starknet"
import {
  addToMultisigPendingTransactions,
  cancelPendingMultisigTransactions,
  multisigPendingTransactionToTransaction,
} from "../../pendingTransactionsStore"
import { MultisigError } from "../../../errors/multisig"

export class MultisigBackendService implements IMultisigBackendService {
  public readonly baseUrl: string

  constructor(baseUrl?: string, private readonly fetcherImpl = fetcher) {
    if (!baseUrl) {
      throw new MultisigError({
        code: "NO_MULTISIG_BASE_URL",
        message: "No multisig base url provided",
      })
    }

    this.baseUrl = baseUrl
  }

  async fetchMultisigDataForSigner({
    signer,
    network,
  }: IFetchMultisigDataForSigner): Promise<ApiMultisigDataForSigner> {
    try {
      const starknetNetwork = networkToStarknetNetwork(network)

      const url = urlWithQuery([this.baseUrl, starknetNetwork], {
        signer,
      })

      const data = await this.fetcherImpl<ApiMultisigDataForSigner>(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

      return ApiMultisigDataForSignerSchema.parse(data)
    } catch (e) {
      throw new Error(`An error occured ${e}`)
    }
  }

  async fetchMultisigAccountData({
    address,
    networkId,
  }: BaseWalletAccount): Promise<ApiMultisigAccountData> {
    try {
      const starknetNetwork = networkIdToStarknetNetwork(networkId)

      const url = urlJoin(this.baseUrl, starknetNetwork, address)

      const data = await this.fetcherImpl(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

      return ApiMultisigAccountDataSchema.parse(data)
    } catch (e) {
      throw new Error(`An error occured ${e}`)
    }
  }

  async fetchMultisigRequests({
    address,
    networkId,
  }: BaseWalletAccount): Promise<ApiMultisigGetRequests> {
    try {
      const starknetNetwork = networkIdToStarknetNetwork(networkId)

      const url = urlJoin(this.baseUrl, starknetNetwork, address, "request")

      const data = await fetcher<unknown>(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

      return ApiMultisigGetRequestsSchema.parse(data)
    } catch (e) {
      throw new Error(`An error occured ${e}`)
    }
  }

  async addNewTransaction({
    address,
    signature,
    calls,
    transactionDetails,
  }: IAddNewTransaction): Promise<InvokeFunctionResponse> {
    const { nonce, version, maxFee, cairoVersion, chainId } = transactionDetails
    const starknetNetwork = chainIdToStarknetNetwork(chainId)
    const networkId = starknetNetworkToNetworkId(starknetNetwork)
    const account: BaseWalletAccount = { address, networkId }

    const multisig = await getMultisigAccountFromBaseWallet(account)

    if (!multisig) {
      throw Error(`Multisig wallet with address ${address} not found`)
    }

    const [creator, r, s] = stark.signatureToHexArray(signature)

    const request = ApiMultisigPostRequestTxnSchema.parse({
      creator,
      transaction: {
        nonce: num.toHex(nonce),
        version: num.toHex(version),
        maxFee: num.toHex(maxFee),
        calls,
      },
      starknetSignature: { r, s },
    })

    const url = urlJoin(this.baseUrl, starknetNetwork, address, "request")

    const response = await fetcher(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    })

    const data = ApiMultisigTxnResponseSchema.parse(response)

    const calldata = transaction.getExecuteCalldata(
      calls,
      cairoVersion, // Only support cairo version 1 for multisig
    )

    const computedTransactionHash = hash.calculateTransactionHash(
      address,
      version,
      calldata,
      maxFee,
      chainId,
      nonce,
    )

    const transactionHash =
      data.content.transactionHash ?? computedTransactionHash

    // If the multisig threshold is 1, we can execute the transaction directly
    if (multisig.threshold !== 1) {
      await addToMultisigPendingTransactions({
        ...data.content,
        requestId: data.content.id,
        timestamp: Date.now(),
        type: "INVOKE",
        account,
        transactionHash,
        notify: false, // Don't notify the creator of the transaction
      })
    }

    return {
      transaction_hash: transactionHash,
    }
  }

  async addRequestSignature({
    address,
    transactionToSign,
    chainId,
    signature,
  }: IAddRequestSignature): Promise<InvokeFunctionResponse> {
    const starknetNetwork = chainIdToStarknetNetwork(chainId)
    const networkId = starknetNetworkToNetworkId(starknetNetwork)
    const multisig = await getMultisigAccountFromBaseWallet({
      address,
      networkId,
    })

    if (!multisig) {
      throw Error(`Multisig wallet with address ${address} not found`)
    }

    const [signer, r, s] = stark.signatureToHexArray(signature)

    const url = urlJoin(
      this.baseUrl,
      starknetNetwork,
      address,
      "request",
      transactionToSign.requestId,
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
        address,
        networkId,
      })
    } else {
      await addToMultisigPendingTransactions({
        ...transactionToSign,
        approvedSigners: data.content.approvedSigners,
        nonApprovedSigners: data.content.nonApprovedSigners,
        state: data.content.state,
        notify: false,
      })
    }

    return {
      transaction_hash: transactionToSign.transactionHash,
    }
  }
}
