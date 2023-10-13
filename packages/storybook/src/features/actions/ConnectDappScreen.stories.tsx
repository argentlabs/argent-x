import { accounts } from "@argent-x/extension/src/ui/features/actions/__fixtures__"
import { ConnectDappScreen } from "@argent-x/extension/src/ui/features/actions/connectDapp/ConnectDappScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: ConnectDappScreen,
  decorators,
  parameters: {
    layout: "fullscreen",
  },
}

export const Default = {
  args: {
    accounts,
    selectedAccount: accounts[3],
    host: "http://localhost:3000",
  },
}

export const Connected = {
  args: {
    ...Default.args,
    isConnected: true,
  },
}
