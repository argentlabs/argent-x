import { ArgentAccountEmailNotificationsScreen } from "./ArgentAccountEmailNotificationsScreen"
import { argentAccountService } from "../../services/argentAccount"

import {
  EmailPreferences,
  emailPreferencesSchema,
  preferencesToEmailPreferences,
} from "../../services/argentAccount/utils"
import { useEmailPreferences } from "./hooks/useEmailPreferences"

export const ArgentAccountEmailNotificationsScreenContainer = () => {
  const { data: emailPreferences, mutate } = useEmailPreferences()

  const updatePreferences = async (
    newValue: boolean,
    key: keyof EmailPreferences,
  ) => {
    const updatedPreferences =
      await argentAccountService.updateEmailPreferences(
        emailPreferencesSchema.parse({
          ...emailPreferences,
          [key]: newValue,
        }),
      )

    if (updatedPreferences) {
      await mutate(preferencesToEmailPreferences.parse(updatedPreferences))
    }
  }

  const onNewsletterChange = (newValue: boolean) =>
    updatePreferences(newValue, "isNewsletterEnabled")
  const onAnnouncementsChange = (newValue: boolean) =>
    updatePreferences(newValue, "isAnnouncementsEnabled")

  return (
    <ArgentAccountEmailNotificationsScreen
      onNewsletterChange={onNewsletterChange}
      onAnnouncementsChange={onAnnouncementsChange}
      isNewsletterEnabled={emailPreferences?.isNewsletterEnabled}
      isAnnouncementsEnabled={emailPreferences?.isAnnouncementsEnabled}
    />
  )
}
