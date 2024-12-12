import type { BaseErrorPayload } from "@argent/x-shared"
import { BaseError } from "@argent/x-shared"

export enum ADDRESS_BOOK_ERROR_MESSAGES {
  ADD_CONTACT_FAILED = "Could not add contact",
  UPDATE_CONTACT_FAILED = "Could not update contact",
  GET_CONTACT_FAILED = "Could not get contact",
  REMOVE_CONTACT_FAILED = "Could not remove contact",
}
export type AddressBookErrorMessage = keyof typeof ADDRESS_BOOK_ERROR_MESSAGES

export class AddressBookError extends BaseError<AddressBookErrorMessage> {
  constructor(payload: BaseErrorPayload<AddressBookErrorMessage>) {
    super(payload, ADDRESS_BOOK_ERROR_MESSAGES)
    this.name = "AddressBookError"
  }
}
