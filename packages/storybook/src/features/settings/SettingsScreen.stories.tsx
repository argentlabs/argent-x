import { SettingsScreen } from "@argent-x/extension/src/ui/features/settings/SettingsScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"

export default {
  title: "features/SettingsScreen",
  component: SettingsScreen,
} as ComponentMeta<typeof SettingsScreen>

const Template: ComponentStory<typeof SettingsScreen> = (props) => (
  <MemoryRouter initialEntries={["/"]}>
    <SettingsScreen {...props}></SettingsScreen>
  </MemoryRouter>
)

export const Default = Template.bind({})
Default.args = {}
