import type {
  ISignatureReviewService,
  SimulateAndReviewPayload,
} from "../../../shared/signatureReview/ISignatureReviewService"
import {
  outsideExecutionMessageSchema,
  outsideExecutionMessageSchemaV2,
  OutsideSignature,
} from "../../../shared/signatureReview/schema"
import type {
  ITransactionReviewService,
  TransactionReviewTransactions,
} from "../../../shared/transactionReview/interface"

export default class BackgroundOutsideSignatureReviewService
  implements ISignatureReviewService
{
  constructor(private transactionReviewService: ITransactionReviewService) {}
  adaptSignature(signature: OutsideSignature): TransactionReviewTransactions[] {
    const executeFromOutsideMessageV2 =
      outsideExecutionMessageSchemaV2.safeParse(signature.message)

    if (executeFromOutsideMessageV2.success) {
      const calls = executeFromOutsideMessageV2.data.Calls.map((call) => {
        return {
          contractAddress: call.To,
          entrypoint: call.Selector,
          calldata: call.Calldata,
        }
      })
      return [{ calls: calls, type: "INVOKE" }]
    }

    // Not really needed, we know at this point that it's a safe message v1 schema, but typescript is not smart enough to pick this up
    const executeFromOutsideMessageV1 = outsideExecutionMessageSchema.safeParse(
      signature.message,
    )

    if (!executeFromOutsideMessageV1.success) {
      return [{ calls: [], type: "INVOKE" }]
    }

    const calls = executeFromOutsideMessageV1.data.calls?.map((call) => {
      return {
        contractAddress: call.to,
        entrypoint: call.selector,
        calldata: call.calldata,
      }
    })

    return [{ calls: calls, type: "INVOKE" }]
  }
  simulateAndReview({
    signature,
    feeTokenAddress,
    appDomain,
  }: SimulateAndReviewPayload) {
    const transactions = this.adaptSignature(signature)
    return this.transactionReviewService.simulateAndReview({
      transactions,
      feeTokenAddress,
      appDomain,
    })
  }
}
