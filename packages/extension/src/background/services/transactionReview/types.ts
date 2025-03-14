import type { Hex } from "@argent/x-shared"
import type { CairoVersion, Call, Calldata, TransactionType } from "starknet"

interface CommonApiTransactionProps {
  type: TransactionType
  chainId: string
  cairoVersion: CairoVersion
  version: string
  account: string
  appDomain?: string
}

export type ApiTransaction = CommonApiTransactionProps &
  (
    | {
        type: typeof TransactionType.DEPLOY_ACCOUNT
        nonce: "0x0"
        calldata: Calldata
        classHash: Hex
        salt: Hex
      }
    | {
        type: typeof TransactionType.INVOKE
        nonce: string
        calls: Call[]
      }
  )

export interface ApiTransactionReviewV2RequestBody {
  transactions: Array<ApiTransaction>
}
