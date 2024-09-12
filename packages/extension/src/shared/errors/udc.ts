import { BaseError, BaseErrorPayload } from "@argent/x-shared"

export enum UDC_ERROR_MESSAGES {
  FETCH_CONTRACT_CONTRUCTOR_PARAMS = "Error while fetching contract constructor params",
  CAIRO_1_NOT_SUPPORTED = "Cairo1 contracts are not supported",
  CAIRO_0_DECLARE_NOT_SUPPORTED = "Declaring Cairo0 contracts is no longer supported",
  DEPLOY_TX_NOT_ADDED = "Deploy Account Transaction could not get added to the sequencer",
  CONTRACT_ALREADY_DECLARED = "Contract is already declared",
  NO_STARKNET_DECLARE = "Account does not support Starknet declare",
  NO_STARKNET_DECLARE_FEE = "Account does not support Starknet Declare Fee",
  NO_DECLARE_CONTRACT = "Could not declare contract",
  NO_DEPLOY_CONTRACT = "Could not deploy contract",
}

export type UdcValidationErrorMessage = keyof typeof UDC_ERROR_MESSAGES

export class UdcError extends BaseError<UdcValidationErrorMessage> {
  constructor(payload: BaseErrorPayload<UdcValidationErrorMessage>) {
    super(payload, UDC_ERROR_MESSAGES)
    this.name = "UdcError"
  }
}
