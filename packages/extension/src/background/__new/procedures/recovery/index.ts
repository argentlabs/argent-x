import { router } from "../../trpc"
import { recoverBackupProcedure } from "./recoverBackup"
import { recoverSeedphraseProcedure } from "./recoverSeedphrase"

export const recoveryRouter = router({
  recoverBackup: recoverBackupProcedure,
  recoverSeedPhrase: recoverSeedphraseProcedure,
})
