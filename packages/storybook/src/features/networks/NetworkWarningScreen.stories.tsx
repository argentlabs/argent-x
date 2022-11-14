import { NetworkWarningScreen } from "@argent-x/extension/src/ui/features/networks/NetworkWarningScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"

export default {
  title: "features/NetworkWarningScreen",
  component: NetworkWarningScreen,
} as ComponentMeta<typeof NetworkWarningScreen>

const Template: ComponentStory<typeof NetworkWarningScreen> = (props) => (
  <MemoryRouter initialEntries={["/"]}>
    <NetworkWarningScreen {...props}></NetworkWarningScreen>
  </MemoryRouter>
)

export const Default = Template.bind({})
Default.args = {}
