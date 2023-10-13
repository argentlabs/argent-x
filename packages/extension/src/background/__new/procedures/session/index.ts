import { router } from "../../trpc"
import { checkPasswordProcedure } from "./checkPassword"
import { isPasswordSetProcedure } from "./isPasswordSet"
import { startProcedure } from "./start"
import { stopProcedure } from "./stop"

export const sessionRouter = router({
  start: startProcedure,
  stop: stopProcedure,
  checkPassword: checkPasswordProcedure,
  isPasswordSet: isPasswordSetProcedure,
})
