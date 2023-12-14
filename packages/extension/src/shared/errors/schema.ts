import { z } from "zod"

export const trpcErrorSchema = z.object({
  data: z.object({
    code: z.string().optional(), // "STARKNAME_NOT_FOUND",
    name: z.string().optional(), // "AddressError"
    message: z.string(), // "foo.stark not found"
  }),
})

export const getMessageFromTrpcError = (error: unknown) => {
  const trpcError = trpcErrorSchema.safeParse(error)
  if (!trpcError.success) {
    return
  }
  return trpcError.data.data.message
}
