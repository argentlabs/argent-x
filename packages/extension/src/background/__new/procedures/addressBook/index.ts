import { router } from "../../trpc"
import { addAddressBookContactProcedure } from "./add"
import { removeAddressBookContactProcedure } from "./remove"
import { updateAddressBookContactProcedure } from "./update"

export const addressBookRouter = router({
  add: addAddressBookContactProcedure,
  update: updateAddressBookContactProcedure,
  remove: removeAddressBookContactProcedure,
})
