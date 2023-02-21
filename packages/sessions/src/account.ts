import assert from "minimalistic-assert"
import {
  Abi,
  Account,
  AccountInterface,
  Call,
  EstimateFee,
  EstimateFeeDetails,
  InvocationsDetails,
  InvocationsSignerDetails,
  InvokeFunctionResponse,
  KeyPair,
  ProviderInterface,
  ProviderOptions,
  SignerInterface,
  constants,
  hash,
  merkle,
  number,
  stark,
  transaction,
} from "starknet"

import {
  SESSION_PLUGIN_CLASS_HASH,
  SignedSession,
  createMerkleTreeForPolicies,
  preparePolicy,
} from "./utils"

export class SessionAccount extends Account implements AccountInterface {
  public merkleTree: merkle.MerkleTree
  private openTransactionHashes: string[] = []

  constructor(
    providerOrOptions: ProviderOptions | ProviderInterface,
    address: string,
    keyPairOrSigner: KeyPair | SignerInterface,
    public signedSession: SignedSession,
  ) {
    super(providerOrOptions, address, keyPairOrSigner)
    this.merkleTree = createMerkleTreeForPolicies(signedSession.policies)
    assert(signedSession.root === this.merkleTree.root, "Invalid session")
  }

  private async sessionToCall(
    session: SignedSession,
    proofs: string[][],
  ): Promise<Call> {
    return {
      contractAddress: this.address,
      entrypoint: "use_plugin",
      calldata: stark.compileCalldata({
        classHash: SESSION_PLUGIN_CLASS_HASH,
        signer: await this.signer.getPubKey(),
        expires: session.expires.toString(),
        root: session.root,
        proofLength: proofs[0].length.toString(),
        ...proofs.reduce(
          (acc, proof, i) => ({
            ...acc,
            ...proof.reduce(
              (acc2, path, j) => ({ ...acc2, [`proof${i}:${j}`]: path }),
              {},
            ),
          }),
          {},
        ),

        token1: session.signature[0],
        token2: session.signature[1],
      }),
    }
  }

  private proofCalls(calls: Call[]): string[][] {
    return calls.map((call) => {
      const leaf = preparePolicy({
        contractAddress: call.contractAddress,
        selector: call.entrypoint,
      })
      return this.merkleTree.getProof(leaf)
    })
  }

  private async extendCallsBySession(
    calls: Call[],
    session: SignedSession,
  ): Promise<Call[]> {
    const proofs = this.proofCalls(calls)
    const pluginCall = await this.sessionToCall(session, proofs)
    return [pluginCall, ...calls]
  }

  public async estimateInvokeFee(
    calls: Call | Call[],
    { nonce: providedNonce, blockIdentifier }: EstimateFeeDetails = {},
  ): Promise<EstimateFee> {
    const transactions = await this.extendCallsBySession(
      Array.isArray(calls) ? calls : [calls],
      this.signedSession,
    )
    const nonce = number.toBN(providedNonce ?? (await this.getNonce()))
    const version = number.toBN(hash.feeTransactionVersion)
    const chainId = await this.getChainId()

    const signerDetails: InvocationsSignerDetails = {
      walletAddress: this.address,
      nonce: number.toBN(nonce),
      maxFee: constants.ZERO,
      version,
      chainId,
    }

    const signature = await this.signer.signTransaction(
      transactions,
      signerDetails,
    )

    const calldata = transaction.fromCallsToExecuteCalldata(transactions)
    const response = await super.getInvokeEstimateFee(
      {
        contractAddress: this.address,
        calldata,
        signature,
      },
      { version, nonce },
      blockIdentifier,
    )

    const suggestedMaxFee = stark.estimatedFeeToMaxFee(response.overall_fee)

    return {
      ...response,
      suggestedMaxFee,
    }
  }

  // check for resolution of any transactions that are not yet counted by account's nonce
  async getOpenTransactionsCount() {
    try {
      const receipts = await Promise.all(
        this.openTransactionHashes
          .filter((txHash) => !!txHash)
          .map((txHash) => this.getTransactionReceipt(txHash)),
      )
      receipts.forEach((receipt) => {
        // if the the transaction status is not "pending" (or prior), transaction should have been counted by nonce
        if (
          receipt &&
          !["NOT_RECEIVED", "RECEIVED", "PENDING"].includes(receipt.status)
        ) {
          const removeIndex = this.openTransactionHashes.indexOf(
            receipt.transaction_hash,
          )
          if (removeIndex > -1) {
            this.openTransactionHashes.splice(removeIndex, 1)
          }
        }
      })

      // return the number of transactions not yet counted by nonce
      return this.openTransactionHashes.length
    } catch {
      return 0
    }
  }

  /**
   * Invoke execute function in account contract
   *
   * [Reference](https://github.com/starkware-libs/cairo-lang/blob/f464ec4797361b6be8989e36e02ec690e74ef285/src/starkware/starknet/services/api/gateway/gateway_client.py#L13-L17)
   *
   * @param calls - one or more calls to be executed
   * @param abis - one or more abis which can be used to display the calls
   * @param transactionsDetail - optional transaction details
   * @returns a confirmation of invoking a function on the starknet contract
   */
  public async execute(
    calls: Call | Call[],
    abis: Abi[] | undefined = undefined,
    transactionsDetail: InvocationsDetails = {},
  ): Promise<InvokeFunctionResponse> {
    const transactions = await this.extendCallsBySession(
      Array.isArray(calls) ? calls : [calls],
      this.signedSession,
    )
    const nonce = number.toBN(
      transactionsDetail.nonce ?? (await this.getNonce()),
    )
    let maxFee: number.BigNumberish = "0"
    if (transactionsDetail.maxFee || transactionsDetail.maxFee === 0) {
      maxFee = transactionsDetail.maxFee
    } else {
      const { suggestedMaxFee } = await this.estimateInvokeFee(
        Array.isArray(calls) ? calls : [calls],
        {
          nonce,
        },
      )
      maxFee = suggestedMaxFee.toString()
    }

    const version = number.toBN(hash.transactionVersion)

    // if explicit nonce passed, use it; otherwise, use the optimistically incremented nonce
    // (estimateInvokeFee above must use the "current"/non-optimistic nonce on the account or
    // it will fail, but the actual execution should use the "optimistic" nonce)
    let optimisticNonce
    if (transactionsDetail.nonce) {
      optimisticNonce = number.toBN(transactionsDetail.nonce)
    } else {
      const openTransactionCount = await this.getOpenTransactionsCount()
      optimisticNonce = number.toBN(parseInt(nonce) + openTransactionCount)
    }

    const signerDetails: InvocationsSignerDetails = {
      walletAddress: this.address,
      nonce: optimisticNonce,
      maxFee,
      version,
      chainId: this.chainId,
    }

    const signature = await this.signer.signTransaction(
      transactions,
      signerDetails,
      abis,
    )

    const calldata = transaction.fromCallsToExecuteCalldata(transactions)

    this.openTransactionHashes.push("")
    try {
      const response = await this.invokeFunction(
        {
          contractAddress: this.address,
          calldata,
          signature,
        },
        {
          maxFee,
          version,
          nonce: optimisticNonce,
        },
      )
      const removeIndex = this.openTransactionHashes.indexOf("")
      if (removeIndex > -1) {
        this.openTransactionHashes[removeIndex] = response.transaction_hash
      }
      return response
    } catch (e) {
      const removeIndex = this.openTransactionHashes.indexOf("")
      if (removeIndex > -1) {
        this.openTransactionHashes.splice(removeIndex, 1)
      }
      throw e
    }
  }
}
