import { num, uint256 } from "starknet"
import { z } from "zod"
import { parseUnits } from "../bigdecimal"

export const parseAmount = (
  amount: string,
  decimals: num.BigNumberish = 18,
) => {
  return parseUnits(amount.replace(",", "."), Number(decimals))
}

export const inputAmountSchema = z
  .string()
  .trim()
  .refine((amount) => amount !== "", {
    message: "Amount is required",
  })
  .refine(
    (amount) => {
      try {
        const bn = parseAmount(amount)
        if (bn < 0n) {
          throw new Error("Amount must be positive")
        }
        if (bn === 0n) {
          throw new Error("Amount can not be zero")
        }
        if (bn > uint256.UINT_256_MAX) {
          throw new Error("Amount is too big")
        }
      } catch {
        throw new Error("Amount should be a number")
      }
      return true
    },
    { message: "Invalid amount" },
  )

export const isValidInputAmount = (amount: string) =>
  Boolean(inputAmountSchema.parse(amount))
