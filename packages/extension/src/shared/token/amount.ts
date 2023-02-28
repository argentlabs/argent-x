import { MaxUint256, parseUnits } from "ethers"
import { number } from "starknet"
import { string } from "yup"

export const parseAmount = (
  amount: string,
  decimals: number.BigNumberish = 18,
) => {
  return parseUnits(amount.replace(",", "."), number.toBN(decimals).toNumber())
}

export const inputAmountSchema = string()
  .trim()
  .required("Amount is required")
  .test((amount, ctx) => {
    if (!amount) {
      return ctx.createError({ message: "Amount is required" })
    }

    try {
      const bn = parseAmount(amount)
      if (bn < 0) {
        return ctx.createError({ message: "Amount must be positive" })
      }
      if (bn === BigInt(0)) {
        return ctx.createError({ message: "Amount can not be zero" })
      }
      if (bn > MaxUint256) {
        return ctx.createError({ message: "Amount is too big" })
      }
    } catch {
      return ctx.createError({ message: "Amount should be a number" })
    }

    return true
  })

export const isValidInputAmount = (amount: string) =>
  inputAmountSchema.isValidSync(amount)
