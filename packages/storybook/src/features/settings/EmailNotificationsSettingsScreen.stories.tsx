import { EmailNotificationsSettingsScreen } from "@argent-x/extension/src/ui/features/settings/preferences/EmailNotificationsSettingsScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: EmailNotificationsSettingsScreen,
  decorators,
}

export const Default = {
  args: {
    isNewsletterEnabled: true,
  },
}
