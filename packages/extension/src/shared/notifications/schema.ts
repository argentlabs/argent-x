import z from "zod"

import { baseWalletAccountSchema } from "../wallet.model"

export const notificationDeepLinkSchema = z.object({
  id: z.string(),
  account: baseWalletAccountSchema,
  route: z.string(),
})

export type NotificationDeepLink = z.infer<typeof notificationDeepLinkSchema>
