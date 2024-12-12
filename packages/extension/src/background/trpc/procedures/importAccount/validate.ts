import { z } from "zod"
import { extensionOnlyProcedure } from "../permissions"
import { importValidationResult } from "../../../../shared/accountImport/types"
import { addressSchema, hexSchema } from "@argent/x-shared"

export const validateImportAccountSchema = z.object({
  address: addressSchema,
  pk: hexSchema,
  networkId: z.string(),
})

export const validateProcedure = extensionOnlyProcedure
  .input(validateImportAccountSchema)
  .output(importValidationResult)
  .query(
    async ({
      input: { address, pk, networkId },
      ctx: {
        services: { importAccountService },
      },
    }) => {
      return await importAccountService.validateImport(address, pk, networkId)
    },
  )
