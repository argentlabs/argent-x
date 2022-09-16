import { number } from "starknet"

import { IExplorerTransactionTransformer } from "./type"

/** fees */

export default function ({
  explorerTransaction,
  result,
}: IExplorerTransactionTransformer) {
  const { maxFee, actualFee } = explorerTransaction
  if (maxFee && actualFee) {
    result = {
      ...result,
      maxFee: number.hexToDecimalString(maxFee),
      actualFee: number.hexToDecimalString(actualFee),
    }
  }
  return result
}
