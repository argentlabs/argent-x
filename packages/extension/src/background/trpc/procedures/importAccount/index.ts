import { router } from "../../trpc"
import { importProcedure } from "./import"
import { validateProcedure } from "./validate"

export const importAccountRouter = router({
  validate: validateProcedure,
  import: importProcedure,
})
