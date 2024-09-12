import {
  explorerTransactionActualFeeSchema,
  IExplorerTransaction,
} from "../../../../explorer/type"

export function getActualFee({ actualFee }: IExplorerTransaction) {
  let actualFeeAmount = "0x0"

  const parsedActualFee =
    explorerTransactionActualFeeSchema.safeParse(actualFee)
  if (parsedActualFee.success) {
    actualFeeAmount = parsedActualFee.data.amount
  } else {
    actualFeeAmount = actualFee as string
  }
  return actualFeeAmount
}
