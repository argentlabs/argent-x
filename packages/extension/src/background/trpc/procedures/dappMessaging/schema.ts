import { z } from "zod"

export const connectDappInputSchema = z.object({
  silent: z.boolean(),
  origin: z.string().optional(),
})

export type ConnectDappInput = z.infer<typeof connectDappInputSchema>
