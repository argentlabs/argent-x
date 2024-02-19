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
  num,
} from "starknet6"
import { MultisigPendingTransaction } from "./pendingTransactionsStore"
import { MultisigSigner } from "./signer"
import { IMultisigBackendService } from "./service/backend/interface"
import { isAccountV5 } from "@argent/shared"
import {
  txVersionSchema,
  TransactionVersion,
} from "../utils/transactionVersion"

function denyTxV3(
  version: TransactionVersion,
): asserts version is Exclude<
  TransactionVersion,
  "0x3" | "0x100000000000000000000000000000003"
> {
  if (version === "0x3" || version === "0x100000000000000000000000000000003") {
    throw Error("Only txv1 is supported")
  }
}

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
    account: Account,
    multisigBackendService: IMultisigBackendService,
  ): MultisigAccount {
    if (!isAccountV5(account)) {
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

  static isMultisig(account: Account): account is MultisigAccount {
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
    const version = txVersionSchema.parse(transactionsDetail.version)
    const chainId = await this.getChainId()

    const maxFee =
      transactionsDetail.maxFee ??
      (
        await this.getSuggestedFee(
          {
            type: TransactionType.INVOKE,
            payload: calls,
          },
          {
            version: "0x1", // TODO: this should be "0x3
            skipValidate: true,
            nonce,
          },
        )
      ).suggestedMaxFee

    // TODO: enable once TXV3 is supported
    // const signerDetails: InvocationsSignerDetails =
    //   version !== "0x3" && version !== "0x100000000000000000000000000000003"
    //     ? ({
    //         // txv2 and below
    //         ...transactionsDetail,
    //         walletAddress: this.address,
    //         chainId,
    //         nonce,
    //         version,
    //         cairoVersion: this.cairoVersion,
    //         maxFee,
    //       } satisfies V2InvocationsSignerDetails)
    //     : ({
    //         // txv3
    //         ...transactionsDetail,
    //         walletAddress: this.address,
    //         chainId,
    //         nonce,
    //         version,
    //         cairoVersion: this.cairoVersion,
    //         accountDeploymentData: [],
    //         feeDataAvailabilityMode: RPC.EDataAvailabilityMode.L1,
    //         nonceDataAvailabilityMode: RPC.EDataAvailabilityMode.L1,
    //         paymasterData: [],
    //         resourceBounds: {
    //           l1_gas: { max_amount: "0x0", max_price_per_unit: "0x0" },
    //           l2_gas: { max_amount: "0x0", max_price_per_unit: "0x0" },
    //         },
    //         tip: 0,
    //       } satisfies V3InvocationsSignerDetails)

    denyTxV3(version)

    const signerDetails = {
      ...transactionsDetail,
      walletAddress: this.address,
      chainId: chainId as any, // TODO: migrate to snjsv6 completely
      nonce,
      version,
      cairoVersion: this.cairoVersion,
      maxFee,
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

    const {
      calls,
      maxFee,
      nonce,
      version: transactionsDetailVersion,
    } = transactionToSign.transaction
    const version = txVersionSchema.parse(transactionsDetailVersion)

    denyTxV3(version)

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
      chainId: chainId as any, // TODO: migrate to snjsv6 completely
      signature,
    })
  }
}
