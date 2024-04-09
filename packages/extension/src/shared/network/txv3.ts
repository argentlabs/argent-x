import { isEqualAddress } from "@argent/x-shared"
import { STRK_TOKEN_ADDRESS, TXV3_ACCOUNT_CLASS_HASH } from "./constants"
import { BaseToken } from "../token/__new/types/token.model"

const tokensRequireTxV3Support = [STRK_TOKEN_ADDRESS]

export function feeTokenNeedsTxV3Support(token: Pick<BaseToken, "address">) {
  return tokensRequireTxV3Support.some((address) =>
    isEqualAddress(address, token.address),
  )
}

const classHashesWithTxV3Support = [TXV3_ACCOUNT_CLASS_HASH]

export function classHashSupportsTxV3(classHash: string | undefined) {
  if (!classHash) return false

  return classHashesWithTxV3Support.some((hash) =>
    isEqualAddress(hash, classHash),
  )
}
