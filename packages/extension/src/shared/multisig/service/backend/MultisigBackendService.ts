import type { AllowArray, InvokeFunctionResponse, Signature } from "starknet"
import { num, stark, transaction, v2hash } from "starknet"
import urlJoin from "url-join"
import { ARGENT_MULTISIG_DISCOVERY_URL } from "../../../api/constants"
import { fetcher } from "../../../api/fetcher"
import { argentXHeaders } from "../../../api/headers"
import { MultisigError } from "../../../errors/multisig"
import { RecoveryError } from "../../../errors/recovery"
import type { Network } from "../../../network"
import {
  chainIdToStarknetNetwork,
  networkIdToStarknetNetwork,
  networkToStarknetNetwork,
  starknetNetworkToNetworkId,
} from "../../../utils/starknetNetwork"
import { urlWithQuery } from "../../../utils/url"
import type {
  BaseWalletAccount,
  MultisigWalletAccount,
} from "../../../wallet.model"
import type {
  ApiMultisigAccountData,
  ApiMultisigDataForSigner,
  ApiMultisigGetSignatureRequestById,
  ApiMultisigGetSignatureRequests,
  ApiMultisigGetTransactionRequests,
  ApiMultisigPostRequestTxn,
  ApiMultisigTransactionState,
  MultisigSignerSignaturesWithId,
} from "../../multisig.model"
import {
  ApiMultisigAccountDataSchema,
  ApiMultisigAddRequestSignatureSchema,
  ApiMultisigDataForSignerSchema,
  ApiMultisigGetTransactionRequestsSchema,
  ApiMultisigPostRequestTxnSchema,
  ApiMultisigTransactionResponseSchema,
  apiMultisigCancelOffchainSignatureRequestSchema,
  apiMultisigGetSignatureRequestByIdSchema,
  apiMultisigGetSignatureRequestsSchema,
  createOffchainSignatureRequestSchema,
  createOffchainSignatureResponseSchema,
  multisigSignerSignatureSchema,
} from "../../multisig.model"
import type { MultisigPendingOffchainSignature } from "../../pendingOffchainSignaturesStore"
import {
  addMultisigPendingOffchainSignatures,
  removeMultisigPendingOffchainSignature,
} from "../../pendingOffchainSignaturesStore"
import type { MultisigPendingTransaction } from "../../pendingTransactionsStore"
import {
  addToMultisigPendingTransactions,
  multisigPendingTransactionToTransaction,
} from "../../pendingTransactionsStore"
import { getMultisigAccountFromBaseWallet } from "../../utils/baseMultisig"
import type { IMultisigBackendService } from "./IMultisigBackendService"
import type {
  IAddOffchainSignature,
  IAddRequestSignature,
  ICancelOffchainSignature,
  ICreateOffchainSignatureRequest,
  ICreateTransactionRequest,
  IFetchMultisigDataForSigner,
  IFetchMultisigOffchainSignatureRequestById,
  IMapTransactionDetails,
  IPrepareTransaction,
  IProcessNewTransactionResponse,
  IProcessRequestSignatureResponse,
  MappedTransactionDetails,
} from "./types"

export class MultisigBackendService implements IMultisigBackendService {
  public readonly baseUrl: string

  constructor(
    baseUrl?: string,
    private readonly fetcherImpl = fetcher,

    // For Multisig Transactions
    public addToTransactionsStore: (
      payload: AllowArray<MultisigPendingTransaction>,
    ) => Promise<void> = addToMultisigPendingTransactions,
    public convertToTransaction: (
      requestId: string,
      state: ApiMultisigTransactionState,
    ) => Promise<void> = multisigPendingTransactionToTransaction,

    // For Multisig Offchain Signatures
    public addToOffchainSignaturesStore: (
      payload: AllowArray<MultisigPendingOffchainSignature>,
    ) => Promise<void> = addMultisigPendingOffchainSignatures,

    public removePendingOffchainSignature: (
      payload: AllowArray<MultisigPendingOffchainSignature>,
    ) => Promise<void> = removeMultisigPendingOffchainSignature,
  ) {
    if (!baseUrl) {
      throw new MultisigError({
        code: "NO_MULTISIG_BASE_URL",
        message: "No multisig base url provided",
      })
    }
    this.baseUrl = baseUrl
  }

  private constructUrlForSigner(
    starknetNetwork: string,
    signer: string,
  ): string {
    return urlWithQuery([this.baseUrl, starknetNetwork], { signer })
  }

  private makeApiCall<T>(
    url: string,
    method: "GET" | "POST" | "PUT" = "GET",
    body?: BodyInit | null | undefined,
  ): Promise<T> {
    return this.fetcherImpl<T>(url, {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...argentXHeaders,
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

  async fetchMultisigTransactionRequests({
    address,
    networkId,
  }: BaseWalletAccount): Promise<ApiMultisigGetTransactionRequests> {
    try {
      const starknetNetwork = networkIdToStarknetNetwork(networkId)
      const url = urlJoin(this.baseUrl, starknetNetwork, address, "request")
      const data = await this.makeApiCall(url)

      return ApiMultisigGetTransactionRequestsSchema.parse(data)
    } catch (e) {
      throw new Error(`An error occured ${e}`)
    }
  }

  async fetchMultisigSignatureRequests(
    account: BaseWalletAccount,
  ): Promise<ApiMultisigGetSignatureRequests> {
    try {
      const starknetNetwork = networkIdToStarknetNetwork(account.networkId)
      const url = urlJoin(
        this.baseUrl,
        starknetNetwork,
        account.address,
        "signatureRequest",
      )
      const data = await this.makeApiCall(url)

      return apiMultisigGetSignatureRequestsSchema.parse(data)
    } catch (e) {
      throw new Error(`An error occured ${e}`)
    }
  }

  async fetchMultisigSignatureRequestById(
    payload: IFetchMultisigOffchainSignatureRequestById,
  ): Promise<ApiMultisigGetSignatureRequestById> {
    try {
      const starknetNetwork = chainIdToStarknetNetwork(payload.chainId)
      const url = urlJoin(
        this.baseUrl,
        starknetNetwork,
        payload.address,
        "signatureRequest",
        payload.requestId,
      )
      const data = await this.makeApiCall(url)

      return apiMultisigGetSignatureRequestByIdSchema.parse(data)
    } catch (e) {
      throw new Error(`An error occured ${e}`)
    }
  }

  private mapTransactionDetails({
    transactionDetails,
    address,
    accountId,
  }: IMapTransactionDetails): MappedTransactionDetails {
    const { nonce, version, chainId, cairoVersion } = transactionDetails
    const starknetNetwork = chainIdToStarknetNetwork(chainId)
    const networkId = starknetNetworkToNetworkId(starknetNetwork)
    const account: BaseWalletAccount = { address, networkId, id: accountId }
    const maxFee =
      "maxFee" in transactionDetails ? transactionDetails.maxFee : 0 // not exists in V3InvocationsSignerDetails
    const resourceBounds =
      "resourceBounds" in transactionDetails
        ? transactionDetails.resourceBounds
        : undefined

    return {
      nonce,
      version,
      maxFee,
      starknetNetwork,
      account,
      chainId,
      cairoVersion,
      resourceBounds,
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
        resource_bounds: mappedDetails.resourceBounds,
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
    const data = ApiMultisigTransactionResponseSchema.parse(response)

    const calldata = transaction.getExecuteCalldata(
      calls,
      cairoVersion, // Only support cairo version 1 for multisig
    )

    const computedTransactionHash = v2hash.calculateTransactionHash(
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

  async createTransactionRequest({
    address,
    accountId,
    signature,
    calls,
    transactionDetails,
  }: ICreateTransactionRequest): Promise<InvokeFunctionResponse> {
    const {
      nonce,
      version,
      maxFee,
      cairoVersion,
      chainId,
      account,
      starknetNetwork,
      resourceBounds,
    } = this.mapTransactionDetails({ transactionDetails, address, accountId })

    const multisig = await this.fetchMultisigAccount(account)
    const request = await this.prepareTransaction({
      signature,
      mappedDetails: {
        nonce,
        version,
        maxFee,
        resourceBounds,
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
    transactionToSign,
  }: IProcessRequestSignatureResponse) {
    const data = ApiMultisigTransactionResponseSchema.parse(response)

    if (data.content.approvedSigners.length === multisig.threshold) {
      await this.convertToTransaction(data.content.id, data.content.state)
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

  async addTransactionSignature({
    address,
    transactionToSign,
    chainId,
    signature,
    accountId,
  }: IAddRequestSignature): Promise<InvokeFunctionResponse> {
    const starknetNetwork = chainIdToStarknetNetwork(chainId)
    const networkId = starknetNetworkToNetworkId(starknetNetwork)
    const multisig = await this.fetchMultisigAccount({
      id: accountId,
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
      transactionToSign,
    })

    return {
      transaction_hash: transactionToSign.transactionHash,
    }
  }

  async createOffchainSignatureRequest({
    address,
    data,
    signature,
    chainId,
    accountId,
  }: ICreateOffchainSignatureRequest): Promise<MultisigSignerSignaturesWithId> {
    const starknetNetwork = chainIdToStarknetNetwork(chainId)
    const networkId = starknetNetworkToNetworkId(starknetNetwork)
    const multisig = await this.fetchMultisigAccount({
      id: accountId,
      address,
      networkId,
    })

    const [creator, r, s] = stark.signatureToHexArray(signature)

    const request = createOffchainSignatureRequestSchema.parse({
      creator,
      message: data,
      signature: { r, s },
    })

    const url = urlJoin(
      this.baseUrl,
      starknetNetwork,
      address,
      "signatureRequest",
    )

    const response = await this.makeApiCall(
      url,
      "POST",
      JSON.stringify(request),
    )

    const { signatures, id, ...res } =
      createOffchainSignatureResponseSchema.parse(response).content

    if (multisig.threshold !== 1) {
      await this.addToOffchainSignaturesStore({
        ...res,
        requestId: id,
        signatures,
        account: multisig,
        timestamp: Date.now(),
        notify: false, // Don't notify the creator of the transaction
      })
    }

    return {
      id,
      signatures,
    }
  }

  async addOffchainSignature(
    payload: IAddOffchainSignature,
  ): Promise<MultisigSignerSignaturesWithId> {
    const { address, signature, chainId, pendingOffchainSignature } = payload
    const starknetNetwork = chainIdToStarknetNetwork(chainId)
    const networkId = starknetNetworkToNetworkId(starknetNetwork)
    const multisig = await this.fetchMultisigAccount({
      id: payload.accountId,
      address,
      networkId,
    })

    const url = urlJoin(
      this.baseUrl,
      starknetNetwork,
      address,
      "signatureRequest",
      pendingOffchainSignature.requestId,
      "signature",
    )

    const [signer, r, s] = stark.signatureToHexArray(signature)
    const request = multisigSignerSignatureSchema.parse({
      signer,
      signature: { r, s },
    })

    const response = await this.makeApiCall(
      url,
      "POST",
      JSON.stringify(request),
    )

    const { signatures, ...res } =
      createOffchainSignatureResponseSchema.parse(response).content

    if (res.approvedSigners.length === multisig.threshold) {
      // Remove from the store once required number of signatures are added
      await this.removePendingOffchainSignature(pendingOffchainSignature)
    } else {
      // Add the signature to the store
      await this.addToOffchainSignaturesStore({
        ...pendingOffchainSignature,
        state: res.state,
        approvedSigners: res.approvedSigners,
        nonApprovedSigners: res.nonApprovedSigners,
        signatures,
        timestamp: Date.now(),
        notify: false,
      })
    }

    return {
      id: pendingOffchainSignature.requestId,
      signatures,
    }
  }

  async cancelOffchainSignature(
    payload: ICancelOffchainSignature,
  ): Promise<void> {
    const { address, chainId, pendingOffchainSignature, signature } = payload
    const starknetNetwork = chainIdToStarknetNetwork(chainId)
    const [creator, r, s] = stark.signatureToHexArray(signature)

    const url = urlJoin(
      this.baseUrl,
      starknetNetwork,
      address,
      "signatureRequest",
      pendingOffchainSignature.requestId,
    )

    const request = apiMultisigCancelOffchainSignatureRequestSchema.parse({
      state: "CANCELLED",
      signer: creator,
      signature: { r, s },
    })

    await this.makeApiCall(url, "PUT", JSON.stringify(request))

    void this.removePendingOffchainSignature(pendingOffchainSignature)
  }

  async discoverMultisigs(network: Network, pubKeys: string[]) {
    const backendNetwork = networkIdToStarknetNetwork(network.id)

    // Don't check for multisig accounts if the network doesn't support them
    if (!network.accountClassHash?.multisig) {
      throw new Error("Network does not support multisig accounts")
    }

    const baseDiscoveryUrl = ARGENT_MULTISIG_DISCOVERY_URL

    if (!baseDiscoveryUrl) {
      throw new RecoveryError({
        code: "ARGENT_MULTISIG_DISCOVERY_URL_NOT_SET",
      })
    }

    const url = urlJoin(baseDiscoveryUrl, backendNetwork)

    const response = await this.makeApiCall(
      url,
      "POST",
      JSON.stringify(pubKeys),
    )

    return ApiMultisigDataForSignerSchema.parse(response)
  }
}
