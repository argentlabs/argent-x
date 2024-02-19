import { ExportPrivateKeyScreen } from "@argent-x/extension/src/ui/features/settings/account/ExportPrivateKeyScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: ExportPrivateKeyScreen,
  decorators,
  parameters: {
    layout: "fullscreen",
  },
}

export const PasswordIsNotValid = {
  args: {
    passwordIsValid: false,
  },
}

export const PasswordIsValid = {
  args: {
    passwordIsValid: true,
    privateKey:
      "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
  },
}
