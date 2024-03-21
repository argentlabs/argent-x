import { SeedSettingsScreen } from "@argent-x/extension/src/ui/features/settings/securityAndPrivacy/SeedSettingsScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: SeedSettingsScreen,
  decorators,
}

export const PasswordIsNotValid = {
  args: {
    passwordIsValid: false,
  },
}

export const PasswordIsValid = {
  args: {
    passwordIsValid: true,
  },
}
