import { router } from "../../trpc"
import { addGuardianToAccountProcedure } from "./addGuardianAccount"
import { addSmartAccountProcedure } from "./addSmartAccount"
import { confirmEmailProcedure } from "./confirmEmail"
import { isTokenExpiredProcedure } from "./isTokenExpired"
import { logoutProcedure } from "./logout"
import { requestEmailProcedure } from "./requestEmail"
import { validateAccountProcedure } from "./validateAccount"

export const argentAccountRouter = router({
  addGuardianAccount: addGuardianToAccountProcedure,
  addSmartAccount: addSmartAccountProcedure,
  validateAccount: validateAccountProcedure,
  requestEmail: requestEmailProcedure,
  confirmEmail: confirmEmailProcedure,
  isTokenExpired: isTokenExpiredProcedure,
  logout: logoutProcedure,
})
