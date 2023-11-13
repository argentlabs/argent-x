import { BaseError, BaseErrorPayload } from "./baseErrors"

export enum ADDRESS_ERROR_MESSAGES {
  NOT_VALID = "Invalid address",
  NOT_FOUND = "Address not found",
  STARKNAME_NOT_FOUND = "Stark name not found",
  NO_ADDRESS_FROM_STARKNAME = "Could not get address from stark name",
  STARKNAME_INVALID_ADDRESS = "Stark name resolved to an invalid address",
}

export type AddressErrorMessage = keyof typeof ADDRESS_ERROR_MESSAGES

export class AddressError extends BaseError<AddressErrorMessage> {
  constructor(payload: BaseErrorPayload<AddressErrorMessage>) {
    super(payload, ADDRESS_ERROR_MESSAGES)
    this.name = "AddressError"
  }
}
