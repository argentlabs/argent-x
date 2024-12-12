import { accounts } from "@argent-x/extension/src/ui/features/actions/__fixtures__"
import { SettingsScreen } from "@argent-x/extension/src/ui/features/settings/SettingsScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: SettingsScreen,
  decorators,
}

export const Default = {
  args: {
    account: accounts[0],
    shouldDisplayGuardianBanner: true,
  },
}
