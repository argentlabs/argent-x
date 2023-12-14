import { BaseError, BaseErrorPayload } from "./baseErrors"

export enum ADDRESS_ERROR_MESSAGES {
  NOT_VALID = "Invalid address",
  NOT_FOUND = "Address not found",
  STARKNAME_NOT_FOUND = "Stark name not found",
  STARKNAME_ERROR = "Could not get address from stark name",
  STARKNAME_INVALID_ADDRESS = "Stark name resolved to an invalid address",
  ARGENT_NAME_NOT_FOUND = "Argent name not found",
  NO_ADDRESS_FROM_ARGENT_NAME = "Could not get address from Argent name",
  ARGENT_NAME_INVALID_ADDRESS = "Argent name resolved to an invalid address",
  NO_ADDRESS_FROM_DOMAIN = "Could not get address from domain",
  ARGENT_NAME_INVALID_NETWORK = "Argent name is not enabled on the requested network",
}

export type AddressErrorMessage = keyof typeof ADDRESS_ERROR_MESSAGES

export class AddressError extends BaseError<AddressErrorMessage> {
  constructor(payload: BaseErrorPayload<AddressErrorMessage>) {
    super(payload, ADDRESS_ERROR_MESSAGES)
    this.name = "AddressError"
  }
}
