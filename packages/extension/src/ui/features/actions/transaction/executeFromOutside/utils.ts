import { TypedData } from "@starknet-io/types-js"
import { anyOutsideExecutionMessageSchema } from "../../../../../shared/signatureReview/schema"

/**
 * Checks if the outside execution message is valid based on a predefined schema.
 * @param dataToSign - The typed data to sign, containing the message.
 * @returns {boolean} - True if the message is valid, false otherwise.
 */
export const isValidOutsideExecutionMessage = (dataToSign: TypedData) => {
  const validOutsideExecution = anyOutsideExecutionMessageSchema.safeParse(
    dataToSign.message,
  )
  return validOutsideExecution.success
}
