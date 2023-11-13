import { z } from "zod"

export const preferencesSchema = z.object({
  value: z.string(),
  platform: z.enum(["ios", "argentx", "android", "webwallet"]).nullable(),
})

export type Preferences = z.infer<typeof preferencesSchema>

export const preferencesEndpointPayload = z.object({
  preferences: z.record(preferencesSchema),
})

export type PreferencesPayload = z.infer<typeof preferencesEndpointPayload>
