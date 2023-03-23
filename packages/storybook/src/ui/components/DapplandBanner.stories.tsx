import { DapplandBanner } from "@argent/ui"
import { ComponentMeta, ComponentStory } from "@storybook/react"

export default {
  title: "components/DapplandBanner",
  component: DapplandBanner,
} as ComponentMeta<typeof DapplandBanner>

const Template: ComponentStory<typeof DapplandBanner> = (props) => (
  <DapplandBanner {...props}></DapplandBanner>
)

export const Default = Template.bind({})
Default.args = {}
