import { z } from "zod"

export const ApiMultisigContentSchema = z.object({
  address: z.string(),
  creator: z.string(),
  signers: z.array(z.string()),
  threshold: z.number(),
})

export const ApiMultisigDataForSignerSchema = z.object({
  totalPages: z.number(),
  totalElements: z.number(),
  size: z.number(),
  content: z.array(ApiMultisigContentSchema),
})

export type ApiMultisigContent = z.infer<typeof ApiMultisigContentSchema>

export type ApiMultisigDataForSigner = z.infer<
  typeof ApiMultisigDataForSignerSchema
>
