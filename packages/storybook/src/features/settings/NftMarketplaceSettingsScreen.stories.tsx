import { NftMarketplaceSettingsScreen } from "@argent-x/extension/src/ui/features/settings/preferences/NftMarketplaceSettingsScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: NftMarketplaceSettingsScreen,
  decorators,
  parameters: {
    layout: "fullscreen",
  },
}

export const Default = {
  args: {
    nftMarketplaceKey: "unframed",
  },
}
