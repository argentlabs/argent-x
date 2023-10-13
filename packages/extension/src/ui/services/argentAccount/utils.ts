import { stringToBooleanSchema } from "@argent/shared"
import { z } from "zod"
import { preferencesEndpointPayload } from "../../../background/__new/procedures/argentAccount/updatePreferences.model"

export const emailPreferencesSchema = z.object({
  isNewsletterEnabled: z.boolean(),
  isAnnouncementsEnabled: z.boolean(),
})

export type EmailPreferences = z.infer<typeof emailPreferencesSchema>

export const preferencesToEmailPreferences =
  preferencesEndpointPayload.transform((val) => {
    const newValue: z.infer<typeof emailPreferencesSchema> = {
      isNewsletterEnabled: false,
      isAnnouncementsEnabled: false,
    }
    if (
      "isNewsletterEnabled" in val.preferences &&
      stringToBooleanSchema.parse(val.preferences.isNewsletterEnabled.value)
    ) {
      newValue.isNewsletterEnabled =
        stringToBooleanSchema.parse(
          val.preferences.isNewsletterEnabled.value,
        ) ?? false
    }
    if (
      "isAnnouncementsEnabled" in val.preferences &&
      stringToBooleanSchema.parse(val.preferences.isAnnouncementsEnabled.value)
    ) {
      newValue.isAnnouncementsEnabled =
        stringToBooleanSchema.parse(
          val.preferences.isAnnouncementsEnabled.value,
        ) ?? false
    }
    return newValue
  })
