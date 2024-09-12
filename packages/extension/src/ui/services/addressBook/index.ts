import { messageClient } from "../trpc"
import { ClientAddressBookService } from "./ClientAddressBookService"

export const addressBookService = new ClientAddressBookService(messageClient)
