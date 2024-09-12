import { SettingsScreen } from "@argent-x/extension/src/ui/features/settings/SettingsScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: SettingsScreen,
  decorators,
}

const account = {
  name: "Account Lorem Ipsum Dolor Sit Amet 10",
  address: "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
  network: {
    id: "sepolia-alpha",
  },
  type: "standard",
}

export const Default = {
  args: {
    account,
    shouldDisplayGuardianBanner: true,
  },
}
