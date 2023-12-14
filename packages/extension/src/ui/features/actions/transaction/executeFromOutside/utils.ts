import { constants, shortString, typedData } from "starknet"
import {
  outsideExecutionMessageSchema,
  whitelistedOutsideExecutionSchema,
} from "./model"
import { Network } from "../../../../../shared/network"
import { encodeChainId } from "../../../../../shared/utils/encodeChainId"

/**
 * Checks if the outside execution message is valid based on a predefined schema.
 * @param dataToSign - The typed data to sign, containing the message.
 * @returns {boolean} - True if the message is valid, false otherwise.
 */
export const isValidOutsideExecutionMessage = (
  dataToSign: typedData.TypedData,
) => {
  const validOutsideExecution = outsideExecutionMessageSchema.safeParse(
    dataToSign.message,
  )
  return validOutsideExecution.success
}

/**
 * Checks if the outside execution is whitelisted and valid based on a predefined schema.
 * @param dataToSign - The typed data to sign, containing the message.
 * @returns {boolean} - True if the message is whitelisted and valid, false otherwise.
 */
export const isValidWhitelistedOutsideExecution = (
  dataToSign: typedData.TypedData,
) => {
  return whitelistedOutsideExecutionSchema.safeParse(dataToSign.message).success
}

/**
 * Validates if the outside execution request is valid for the given network.
 * @param dataToSign - The typed data to sign, containing the domain and message.
 * @param network - The network on which the validation is being performed.
 * @returns {boolean} - True if the outside execution request is valid, false otherwise.
 */
export const validateOutsideExecution = (
  dataToSign: typedData.TypedData,
  network?: Network,
) => {
  if (!network) {
    return false
  }
  const encodedDomainChainId = encodeChainId(dataToSign.domain.chainId)
  const encodedNetworkChainId = shortString.encodeShortString(network.chainId)
  const isMainnet = encodedNetworkChainId === constants.StarknetChainId.SN_MAIN

  return (
    encodedDomainChainId === encodedNetworkChainId &&
    (isMainnet
      ? isValidWhitelistedOutsideExecution(dataToSign)
      : isValidOutsideExecutionMessage(dataToSign))
  )
}
