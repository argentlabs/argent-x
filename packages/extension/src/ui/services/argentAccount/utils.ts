import { stringToBooleanSchema } from "@argent/shared"
import { z } from "zod"
import {
  preferencesEndpointPayload,
  emailPreferencesSchema,
} from "../../../shared/argentAccount/schema"

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
