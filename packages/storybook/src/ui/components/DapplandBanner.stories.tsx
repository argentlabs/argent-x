import { DapplandBanner } from "@argent/ui"
import dapplandBanner from "@argent/ui/assets/dapplandBannerBackground.png"
import { action } from "@storybook/addon-actions"
import { ComponentMeta, ComponentStory } from "@storybook/react"

export default {
  title: "components/DapplandBanner",
  component: DapplandBanner,
} as ComponentMeta<typeof DapplandBanner>

const Template: ComponentStory<typeof DapplandBanner> = (props) => (
  <DapplandBanner {...props}></DapplandBanner>
)

export const Default = Template.bind({})
Default.args = {
  title: "Discover",
  subTitle: "Starknet dapps",
  backgroundImageUrl: dapplandBanner,
  href: "https://www.dappland.com?utm_source=argent&utm_medium=extension&utm_content=banner",
  onClose: action("onClose"),
}
