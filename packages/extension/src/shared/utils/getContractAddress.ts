import { addressSchema, getAccountContractAddress } from "@argent/x-shared"
import memoize from "memoizee"

export const getCairo1AccountContractAddress = memoize(
  (classHash: string, publicKey: string) =>
    addressSchema.parse(getAccountContractAddress("1", classHash, publicKey)),
  { primitive: true },
)

export const getCairo0AccountContractAddress = memoize(
  (classHash: string, publicKey: string) =>
    addressSchema.parse(getAccountContractAddress("0", classHash, publicKey)),
  { primitive: true },
)
