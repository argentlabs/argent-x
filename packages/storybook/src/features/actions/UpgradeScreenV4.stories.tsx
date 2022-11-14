import { UpgradeScreenV4 } from "@argent-x/extension/src/ui/features/accounts/UpgradeScreenV4"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"

export default {
  title: "features/UpgradeScreenv4",
  component: UpgradeScreenV4,
} as ComponentMeta<typeof UpgradeScreenV4>

const Template: ComponentStory<typeof UpgradeScreenV4> = (props) => (
  <MemoryRouter initialEntries={["/"]}>
    <UpgradeScreenV4 {...props}></UpgradeScreenV4>
  </MemoryRouter>
)

export const Default = Template.bind({})

Default.args = {
  upgradeType: "account",
}

export const NetworkUpgrade = Template.bind({})

NetworkUpgrade.args = {
  upgradeType: "network",
}
