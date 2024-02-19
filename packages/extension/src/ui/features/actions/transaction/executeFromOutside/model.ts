import {
  addressSchema,
  bigNumberishSchema,
  isEqualAddress,
} from "@argent/shared"
import { z } from "zod"
import { getWhitelistedContracts } from "./whitelist"

export const outsideCallSchema = z.object({
  to: addressSchema,
  selector: z.string(),
  calldata_len: bigNumberishSchema,
  calldata: z.array(bigNumberishSchema).nonempty().or(z.tuple([])), // can be an empty array
})

/**
 * Schema for validating the structure of an outside execution request message.
 * It includes the caller's address, nonce for replay protection, and a time window for execution.
 * The calls array contains the contract calls to be executed, which must be non-empty.
 * See https://github.com/starknet-io/SNIPs/blob/main/SNIPS/snip-9.md#1-build-the-outsideexecution-struct
 */
export const outsideExecutionMessageSchema = z.object({
  caller: addressSchema, // The Starknet address of the caller
  nonce: bigNumberishSchema, // Nonce for replay protection
  execute_after: bigNumberishSchema, // Timestamp after which the execution is valid
  execute_before: bigNumberishSchema, // Timestamp before which the execution must occur
  calls: z.array(outsideCallSchema).nonempty(), // An array of contract calls or a single call
})

/**
 * Refinement of the outsideExecutionSchema to ensure the caller is whitelisted.
 * This is used to restrict who can execute transactions from outside.
 */
export const whitelistedOutsideExecutionSchema =
  outsideExecutionMessageSchema.refine((data) => {
    // Retrieve the list of whitelisted contracts. If empty, no one can execute from outside.
    const whitelistedContracts = getWhitelistedContracts()
    // Check if the caller's address is in the list of whitelisted contracts
    return whitelistedContracts.some((contract) =>
      isEqualAddress(contract, data.caller),
    )
  })
