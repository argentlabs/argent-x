import { TransactionType } from "starknet"
import type {
  ISignatureReviewService,
  SimulateAndReviewPayload,
} from "../../../shared/signatureReview/ISignatureReviewService"
import type { OutsideSignature } from "../../../shared/signatureReview/schema"
import {
  outsideExecutionMessageSchema,
  outsideExecutionMessageSchemaV2,
} from "../../../shared/signatureReview/schema"
import type { ITransactionReviewService } from "../../../shared/transactionReview/interface"
import type { InvokeTransaction } from "../../../shared/transactionReview/transactionAction.model"

export default class BackgroundOutsideSignatureReviewService
  implements ISignatureReviewService
{
  constructor(private transactionReviewService: ITransactionReviewService) {}
  adaptSignature(signature: OutsideSignature): InvokeTransaction {
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
      return { payload: calls, type: TransactionType.INVOKE }
    }

    // Not really needed, we know at this point that it's a safe message v1 schema, but typescript is not smart enough to pick this up
    const executeFromOutsideMessageV1 = outsideExecutionMessageSchema.safeParse(
      signature.message,
    )

    if (!executeFromOutsideMessageV1.success) {
      return { payload: [], type: TransactionType.INVOKE }
    }

    const calls = executeFromOutsideMessageV1.data.calls?.map((call) => {
      return {
        contractAddress: call.to,
        entrypoint: call.selector,
        calldata: call.calldata,
      }
    })
    return { payload: calls, type: TransactionType.INVOKE }
  }

  simulateAndReview({ signature, appDomain }: SimulateAndReviewPayload) {
    const transaction = this.adaptSignature(signature)
    return this.transactionReviewService.simulateAndReview({
      transaction,
      appDomain,
    })
  }
}
