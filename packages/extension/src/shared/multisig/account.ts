import {
  Abi,
  Account,
  AllowArray,
  CairoVersion,
  Call,
  InvocationsDetails,
  InvocationsSignerDetails,
  InvokeFunctionResponse,
  ProviderInterface,
  ProviderOptions,
  TransactionType,
  hash,
  num,
} from "starknet"
import { Account as AccountV4__deprecated } from "starknet4-deprecated"
import { MultisigPendingTransaction } from "./pendingTransactionsStore"
import { MultisigSigner } from "./signer"
import { isAccountV4__deprecated } from "../utils/accountv4"
import { IMultisigBackendService } from "./service/backend/interface"

export class MultisigAccount extends Account {
  public readonly multisigBackendService: IMultisigBackendService

  constructor(
    providerOrOptions: ProviderInterface | ProviderOptions,
    address: string,
    pkOrSigner: MultisigSigner | Uint8Array | string,
    cairoVersion: CairoVersion = "1", // Only Cairo version 1 is supported for multisig
    multisigBackendService: IMultisigBackendService,
  ) {
    const multisigSigner =
      typeof pkOrSigner === "string" || pkOrSigner instanceof Uint8Array
        ? new MultisigSigner(pkOrSigner)
        : pkOrSigner
    super(providerOrOptions, address, multisigSigner, cairoVersion)

    this.multisigBackendService = multisigBackendService
  }

  static fromAccount(
    account: Account | AccountV4__deprecated,
    multisigBackendService: IMultisigBackendService,
  ): MultisigAccount {
    if (isAccountV4__deprecated(account)) {
      throw Error("Multisig is not supported for old accounts")
    }

    if (account.signer instanceof MultisigSigner) {
      return new MultisigAccount(
        account,
        account.address,
        account.signer,
        "1", // Only Cairo version 1 is supported for multisig
        multisigBackendService,
      )
    }

    throw Error("Signer is not a MultisigSigner")
  }

  static isMultisig(
    account: Account | AccountV4__deprecated,
  ): account is MultisigAccount {
    return (
      "multisigBackendService" in account && !!account.multisigBackendService
    )
  }

  public async execute(
    calls: AllowArray<Call>,
    abis?: Abi[] | undefined,
    transactionsDetail: InvocationsDetails = {},
  ): Promise<InvokeFunctionResponse> {
    const transactions = Array.isArray(calls) ? calls : [calls]
    const nonce = num.toHex(transactionsDetail.nonce ?? (await this.getNonce()))
    const version = num.toBigInt(hash.transactionVersion).toString()
    const chainId = await this.getChainId()

    const maxFee =
      transactionsDetail.maxFee ??
      (await this.getSuggestedMaxFee(
        {
          type: TransactionType.INVOKE,
          payload: calls,
        },
        {
          skipValidate: true,
          nonce,
        },
      ))

    const signerDetails: InvocationsSignerDetails = {
      walletAddress: this.address,
      chainId,
      nonce,
      version,
      maxFee,
      cairoVersion: this.cairoVersion,
    }

    const signature = await this.signer.signTransaction(
      transactions,
      signerDetails,
      abis,
    )

    return this.multisigBackendService.addNewTransaction({
      address: this.address,
      calls: transactions,
      transactionDetails: signerDetails,
      signature,
    })
  }

  public async addRequestSignature(
    transactionToSign: MultisigPendingTransaction,
  ) {
    const chainId = await this.getChainId()

    const { calls, maxFee, nonce, version } = transactionToSign.transaction

    const signerDetails: InvocationsSignerDetails = {
      walletAddress: this.address,
      chainId,
      nonce,
      version,
      maxFee,
      cairoVersion: this.cairoVersion,
    }

    const signature = await this.signer.signTransaction(calls, signerDetails)

    return this.multisigBackendService.addRequestSignature({
      address: this.address,
      transactionToSign,
      chainId,
      signature,
    })
  }
}
