import { router } from "../../trpc"
import { addAccountProcedure } from "./addAccount"
import { requestEmailProcedure } from "./requestEmail"
import { confirmEmailProcedure } from "./confirmEmail"
import { validateAccountProcedure } from "./validateAccount"
import { isTokenExpiredProcedure } from "./isTokenExpired"
import { logoutProcedure } from "./logout"
import { updatePreferencesProcedure } from "./updatePreferences"
import { getPreferencesProcedure } from "./getPreferences"

export const argentAccountRouter = router({
  addAccount: addAccountProcedure,
  validateAccount: validateAccountProcedure,
  requestEmail: requestEmailProcedure,
  confirmEmail: confirmEmailProcedure,
  isTokenExpired: isTokenExpiredProcedure,
  logout: logoutProcedure,
  updatePreferences: updatePreferencesProcedure,
  getPreferences: getPreferencesProcedure,
})
