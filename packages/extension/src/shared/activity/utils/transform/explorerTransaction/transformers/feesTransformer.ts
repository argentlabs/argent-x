import { number } from "starknet"

import { IExplorerTransactionTransformer } from "./type"
import { getActualFee } from "../getActualFee"

/** fees */

export default function ({
  explorerTransaction,
  result,
}: IExplorerTransactionTransformer) {
  const { maxFee } = explorerTransaction
  const actualFee = getActualFee(explorerTransaction)

  if (maxFee && actualFee) {
    result = {
      ...result,
      maxFee: number.hexToDecimalString(maxFee),
      actualFee: number.hexToDecimalString(actualFee),
    }
  }
  return result
}
