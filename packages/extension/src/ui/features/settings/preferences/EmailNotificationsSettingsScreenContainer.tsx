import { EmailNotificationsSettingsScreen } from "./EmailNotificationsSettingsScreen"
import { argentAccountService } from "../../../services/argentAccount"

import {
  EmailPreferences,
  emailPreferencesSchema,
} from "../../../../shared/argentAccount/schema"
import { useEmailPreferences } from "../../argentAccount/hooks/useEmailPreferences"
import { useDebounce } from "@argent/shared"
import { useNavigateReturnToOrBack } from "../../../hooks/useNavigateReturnTo"

export const EmailNotificationsSettingsScreenContainer = () => {
  const { data: emailPreferences, mutate } = useEmailPreferences()

  const updateServicePreferences = async (
    key: keyof EmailPreferences,
    newValue: boolean,
  ) => {
    await argentAccountService.updateEmailPreferences(
      emailPreferencesSchema.parse({
        ...emailPreferences,
        [key]: newValue,
      }),
    )
    /** re-fetch from server */
    await mutate()
  }

  const debouncedUpdateServicePreferences = useDebounce(
    updateServicePreferences,
    500,
  )

  const updatePreferences = async (
    key: keyof EmailPreferences,
    newValue: boolean,
  ) => {
    const updatedPreferences = emailPreferencesSchema.parse({
      ...emailPreferences,
      [key]: newValue,
    })
    /** optimistic update to local state, don't re-fetch yet */
    await mutate(updatedPreferences, { revalidate: false })
    debouncedUpdateServicePreferences(key, newValue)
  }

  const onNewsletterChange = (newValue: boolean) =>
    updatePreferences("isNewsletterEnabled", newValue)

  const onAnnouncementsChange = (newValue: boolean) =>
    updatePreferences("isAnnouncementsEnabled", newValue)

  const onBack = useNavigateReturnToOrBack()

  return (
    <EmailNotificationsSettingsScreen
      onBack={onBack}
      onNewsletterChange={onNewsletterChange}
      onAnnouncementsChange={onAnnouncementsChange}
      isNewsletterEnabled={emailPreferences?.isNewsletterEnabled}
      isAnnouncementsEnabled={emailPreferences?.isAnnouncementsEnabled}
    />
  )
}
