import { messageClient } from "../messaging/trpc"
import { AddressBookService } from "./client"

export const addressBookService = new AddressBookService(messageClient)
