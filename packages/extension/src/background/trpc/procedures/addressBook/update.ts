import { addressBookContactSchema } from "../../../../shared/addressBook/schema"
import { addressBookService } from "../../../../shared/addressBook/service"
import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"

export const updateAddressBookContactProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(addressBookContactSchema)
  .output(addressBookContactSchema)
  .mutation(async ({ input }) => {
    return addressBookService.update(input)
  })
