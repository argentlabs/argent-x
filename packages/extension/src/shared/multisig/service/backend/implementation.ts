import urlJoin from "url-join"
import { fetcher } from "../../../api/fetcher"
import {
  chainIdToStarknetNetwork,
  networkIdToStarknetNetwork,
  networkToStarknetNetwork,
  starknetNetworkToNetworkId,
} from "../../../utils/starknetNetwork"
import { urlWithQuery } from "../../../utils/url"
import { BaseWalletAccount, MultisigWalletAccount } from "../../../wallet.model"
import {
  ApiMultisigAccountData,
  ApiMultisigAccountDataSchema,
  ApiMultisigAddRequestSignatureSchema,
  ApiMultisigDataForSigner,
  ApiMultisigDataForSignerSchema,
  ApiMultisigGetRequests,
  ApiMultisigGetRequestsSchema,
  ApiMultisigPostRequestTxn,
  ApiMultisigPostRequestTxnSchema,
  ApiMultisigState,
  ApiMultisigTxnResponseSchema,
} from "../../multisig.model"
import { IMultisigBackendService } from "./interface"
import {
  IAddNewTransaction,
  IAddRequestSignature,
  IFetchMultisigDataForSigner,
  IMapTransactionDetails,
  IPrepareTransaction,
  IProcessNewTransactionResponse,
  IProcessRequestSignatureResponse,
  MappedTransactionDetails,
} from "./types"
import { getMultisigAccountFromBaseWallet } from "../../utils/baseMultisig"
import {
  AllowArray,
  InvokeFunctionResponse,
  Signature,
  hash,
  num,
  stark,
  transaction,
} from "starknet"
import {
  MultisigPendingTransaction,
  addToMultisigPendingTransactions,
  cancelPendingMultisigTransactions,
  multisigPendingTransactionToTransaction,
} from "../../pendingTransactionsStore"
import { MultisigError } from "../../../errors/multisig"

export class MultisigBackendService implements IMultisigBackendService {
  public readonly baseUrl: string
  public addToTransactionsStore: (
    payload: AllowArray<MultisigPendingTransaction>,
  ) => Promise<void>
  public cancelPendingTransactions: (
    account: BaseWalletAccount,
  ) => Promise<void>
  public convertToTransaction: (
    requestId: string,
    state: ApiMultisigState,
  ) => Promise<void>

  constructor(
    baseUrl?: string,
    private readonly fetcherImpl = fetcher,
    addToTransactionsStore: (
      payload: AllowArray<MultisigPendingTransaction>,
    ) => Promise<void> = addToMultisigPendingTransactions,
    cancelPendingTransactions: (
      account: BaseWalletAccount,
    ) => Promise<void> = cancelPendingMultisigTransactions,
    convertToTransaction: (
      requestId: string,
      state: ApiMultisigState,
    ) => Promise<void> = multisigPendingTransactionToTransaction,
  ) {
    if (!baseUrl) {
      throw new MultisigError({
        code: "NO_MULTISIG_BASE_URL",
        message: "No multisig base url provided",
      })
    }
    this.addToTransactionsStore = addToTransactionsStore
    this.cancelPendingTransactions = cancelPendingTransactions
    this.convertToTransaction = convertToTransaction
    this.baseUrl = baseUrl
  }

  private constructUrlForSigner(
    starknetNetwork: string,
    signer: string,
  ): string {
    return urlWithQuery([this.baseUrl, starknetNetwork], { signer })
  }

  private async makeApiCall<T>(
    url: string,
    method: "GET" | "POST" = "GET",
    body?: BodyInit | null | undefined,
  ): Promise<T> {
    return await this.fetcherImpl<T>(url, {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body,
    })
  }

  async fetchMultisigDataForSigner({
    signer,
    network,
  }: IFetchMultisigDataForSigner): Promise<ApiMultisigDataForSigner> {
    try {
      const starknetNetwork = networkToStarknetNetwork(network)
      const url = this.constructUrlForSigner(starknetNetwork, signer)
      const data = await this.makeApiCall<ApiMultisigDataForSigner>(url)

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
      const data = await this.makeApiCall(url)

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
      const data = await this.makeApiCall(url)

      return ApiMultisigGetRequestsSchema.parse(data)
    } catch (e) {
      throw new Error(`An error occured ${e}`)
    }
  }

  private mapTransactionDetails({
    transactionDetails,
    address,
  }: IMapTransactionDetails): MappedTransactionDetails {
    const { nonce, version, maxFee, chainId, cairoVersion } = transactionDetails
    const starknetNetwork = chainIdToStarknetNetwork(chainId)
    const networkId = starknetNetworkToNetworkId(starknetNetwork)
    const account: BaseWalletAccount = { address, networkId }

    return {
      nonce,
      version,
      maxFee,
      starknetNetwork,
      account,
      chainId,
      cairoVersion,
    }
  }

  private async fetchMultisigAccount(
    account: BaseWalletAccount,
  ): Promise<MultisigWalletAccount> {
    const multisig = await getMultisigAccountFromBaseWallet(account)
    if (!multisig) {
      throw Error(`Multisig wallet with address ${account.address} not found`)
    }
    return multisig
  }

  private async prepareTransaction({
    signature,
    mappedDetails,
    calls,
  }: IPrepareTransaction): Promise<ApiMultisigPostRequestTxn> {
    const [creator, r, s] = stark.signatureToHexArray(signature)
    return ApiMultisigPostRequestTxnSchema.parse({
      creator,
      transaction: {
        nonce: num.toHex(mappedDetails.nonce),
        version: num.toHex(mappedDetails.version),
        maxFee: num.toHex(mappedDetails.maxFee),
        calls,
      },
      starknetSignature: { r, s },
    })
  }

  private async processNewTransactionApiResponse({
    response,
    calls,
    cairoVersion,
    chainId,
    nonce,
    maxFee,
    address,
    version,
  }: IProcessNewTransactionResponse) {
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
    return { transactionHash, content: data.content }
  }

  async addNewTransaction({
    address,
    signature,
    calls,
    transactionDetails,
  }: IAddNewTransaction): Promise<InvokeFunctionResponse> {
    const {
      nonce,
      version,
      maxFee,
      cairoVersion,
      chainId,
      account,
      starknetNetwork,
    } = this.mapTransactionDetails({ transactionDetails, address })

    const multisig = await this.fetchMultisigAccount(account)
    const request = await this.prepareTransaction({
      signature,
      mappedDetails: {
        nonce,
        version,
        maxFee,
      },
      calls,
    })

    const url = urlJoin(this.baseUrl, starknetNetwork, address, "request")

    const response = await this.makeApiCall(
      url,
      "POST",
      JSON.stringify(request),
    )

    const { transactionHash, content } =
      await this.processNewTransactionApiResponse({
        response,
        calls,
        cairoVersion,
        chainId,
        nonce,
        maxFee,
        address,
        version,
      })
    // If the multisig threshold is 1, we can execute the transaction directly
    if (multisig.threshold !== 1) {
      await this.addToTransactionsStore({
        ...content,
        requestId: content.id,
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

  private async prepareRequestSignature(signature: Signature) {
    const [signer, r, s] = stark.signatureToHexArray(signature)
    const request = ApiMultisigAddRequestSignatureSchema.parse({
      signer,
      starknetSignature: { r, s },
    })
    return request
  }

  private async processRequestSignatureApiResponse({
    response,
    multisig,
    address,
    networkId,
    transactionToSign,
  }: IProcessRequestSignatureResponse) {
    const data = ApiMultisigTxnResponseSchema.parse(response)

    if (data.content.approvedSigners.length === multisig.threshold) {
      await this.convertToTransaction(data.content.id, data.content.state)

      await this.cancelPendingTransactions({
        address,
        networkId,
      })
    } else {
      await this.addToTransactionsStore({
        ...transactionToSign,
        approvedSigners: data.content.approvedSigners,
        nonApprovedSigners: data.content.nonApprovedSigners,
        state: data.content.state,
        notify: false,
      })
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
    const multisig = await this.fetchMultisigAccount({
      address,
      networkId,
    })

    const url = urlJoin(
      this.baseUrl,
      starknetNetwork,
      address,
      "request",
      transactionToSign.requestId,
      "signature",
    )
    const request = await this.prepareRequestSignature(signature)

    const response = await this.makeApiCall(
      url,
      "POST",
      JSON.stringify(request),
    )

    void this.processRequestSignatureApiResponse({
      response,
      multisig,
      address,
      networkId,
      transactionToSign,
    })

    return {
      transaction_hash: transactionToSign.transactionHash,
    }
  }
}
