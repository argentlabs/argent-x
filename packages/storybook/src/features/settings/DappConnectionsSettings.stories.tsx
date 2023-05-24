import { DappConnectionsSettings } from "@argent-x/extension/src/ui/features/settings/DappConnectionsSettingsScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: DappConnectionsSettings,
  decorators,
  parameters: {
    layout: "fullscreen",
  },
}

export const Empty = {
  args: {},
}

export const Populated = {
  args: {
    preauthorizedHosts: [
      "http://examples.com",
      "http://lorem-ipsum-dolor-sit-amet.com",
    ],
  },
}
