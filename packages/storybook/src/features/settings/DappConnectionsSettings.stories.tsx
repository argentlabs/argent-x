import { DappConnectionsSettings } from "@argent-x/extension/src/ui/features/settings/DappConnectionsSettingsScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"

export default {
  title: "features/DappConnectionsSettings",
  component: DappConnectionsSettings,
} as ComponentMeta<typeof DappConnectionsSettings>

const Template: ComponentStory<typeof DappConnectionsSettings> = (props) => (
  <MemoryRouter initialEntries={["/"]}>
    <DappConnectionsSettings {...props}></DappConnectionsSettings>
  </MemoryRouter>
)

export const Empty = Template.bind({})
Empty.args = {}

export const Populated = Template.bind({})
Populated.args = {
  preauthorizedHosts: [
    "http://examples.com",
    "http://lorem-ipsum-dolor-sit-amet.com",
  ],
}
