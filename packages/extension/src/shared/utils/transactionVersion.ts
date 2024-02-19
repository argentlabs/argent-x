import { num } from "starknet"
import { z } from "zod"

// TransactionInvokeVersion is designated for the actual execution of transactions.
export type TransactionInvokeVersion = "0x0" | "0x1" | "0x2" | "0x3"

// TransactionSimulationVersion is utilized during fee estimation and simulation.
// It is intentionally kept distinct from TransactionInvokeVersion to prevent
// the possibility of replaying signatures from simulations in actual transactions.
export type TransactionSimulationVersion =
  | "0x100000000000000000000000000000000"
  | "0x100000000000000000000000000000001"
  | "0x100000000000000000000000000000002"
  | "0x100000000000000000000000000000003"

// TransactionVersion - union of both the invoke and simulation versions.
export type TransactionVersion =
  | TransactionInvokeVersion
  | TransactionSimulationVersion

const validTxVersions: TransactionVersion[] = [
  "0x0",
  "0x1",
  "0x2",
  "0x3",
  "0x100000000000000000000000000000000",
  "0x100000000000000000000000000000001",
  "0x100000000000000000000000000000002",
  "0x100000000000000000000000000000003",
]

export const txVersionSchema = z
  .string()
  .default("0x3")
  .refine((v) => {
    const n = num.toBigInt(v)

    // Ensure that the provided version is a valid transaction version.
    return validTxVersions.map((v) => num.toBigInt(v)).includes(n)
  })
  .transform((v) => {
    // Convert the valid transaction version to hexadecimal format.
    return num.toHex(v) as TransactionVersion
  })
