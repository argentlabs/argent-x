import { DapplandBanner } from "@argent/ui"
import dapplandBanner from "@argent/ui/assets/dapplandBannerBackground.png"
import { action } from "@storybook/addon-actions"

export default {
  component: DapplandBanner,
}

export const Default = {
  args: {
    title: "Discover",
    subTitle: "Starknet dapps",
    backgroundImageUrl: dapplandBanner,
    href: "https://www.dappland.com?utm_source=argent&utm_medium=extension&utm_content=banner",
    onClose: action("onClose"),
  },
}
