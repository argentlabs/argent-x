import { router } from "../../trpc"
import { clearErrorRecoveringProcedure } from "./clearErrorRecovering"
import { recoverBackupProcedure } from "./recoverBackup"
import { recoverSeedphraseProcedure } from "./recoverSeedphrase"

export const recoveryRouter = router({
  recoverBackup: recoverBackupProcedure,
  recoverSeedPhrase: recoverSeedphraseProcedure,
  clearErrorRecovering: clearErrorRecoveringProcedure,
})
