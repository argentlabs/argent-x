import { SwitchNetworkScreen } from "@argent-x/extension/src/ui/features/actions/SwitchNetworkScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: SwitchNetworkScreen,
  decorators,
}

export const Default = {
  args: {
    fromNetworkTitle: "Mainnet",
    toNetworkTitle: "Testnet",
    host: "http://localhost:3000",
  },
}

export const LongTitle = {
  args: {
    fromNetworkTitle: "Mainnet Lorem Ipsum Dolor",
    toNetworkTitle: "Testnet Sit Amet",
    host: "http://localhost:3000",
  },
}
