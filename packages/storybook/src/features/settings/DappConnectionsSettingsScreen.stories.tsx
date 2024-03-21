import { DappConnectionsAccountScreen } from "@argent-x/extension/src/ui/features/settings/connectedDapps/DappConnectionsAccountScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: DappConnectionsAccountScreen,
  decorators,
}

export const Empty = {
  args: {},
}

export const Populated = {
  args: {
    preAuthorizations: [
      {
        host: "https://app.starknet.id",
      },
      {
        host: "http://examples.com",
      },
      {
        host: "http://lorem-ipsum-dolor-sit-amet.com",
      },
    ],
  },
}
