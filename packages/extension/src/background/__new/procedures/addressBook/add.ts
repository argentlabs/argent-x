import { z } from "zod"

import {
  addressBookContactNoIdSchema,
  addressBookContactSchema,
} from "../../../../shared/addressBook/schema"
import { addressBookService } from "../../../../shared/addressBook/service"
import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"

export const addAddressBookContactProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(z.union([addressBookContactNoIdSchema, addressBookContactSchema]))
  .output(addressBookContactSchema)
  .mutation(async ({ input }) => {
    return addressBookService.add(input)
  })
