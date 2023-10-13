import { addressBookContactSchema } from "../../../../shared/addressBook/schema"
import { addressBookService } from "../../../../shared/addressBook/service"
import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"

export const removeAddressBookContactProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(addressBookContactSchema)
  .output(addressBookContactSchema)
  .mutation(async ({ input }) => {
    return addressBookService.remove(input)
  })
