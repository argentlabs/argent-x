import { z } from "zod"

import { extensionOnlyProcedure } from "../permissions"

const recoverBackupSchema = z.object({
  backup: z.string(),
})

export const recoverBackupProcedure = extensionOnlyProcedure
  .input(recoverBackupSchema)
  .mutation(
    async ({
      input: { backup },
      ctx: {
        services: { recoveryService },
      },
    }) => {
      return recoveryService.byBackup(backup)
    },
  )
