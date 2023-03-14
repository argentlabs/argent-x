import { ShieldBaseEmailScreen } from "@argent-x/extension/src/ui/features/shield/ShieldBaseEmailScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"

export default {
  title: "shield/ShieldBaseEmailScreen",
  component: ShieldBaseEmailScreen,
} as ComponentMeta<typeof ShieldBaseEmailScreen>

const Template: ComponentStory<typeof ShieldBaseEmailScreen> = (props) => (
  <MemoryRouter initialEntries={["/"]}>
    <ShieldBaseEmailScreen {...props} />
  </MemoryRouter>
)

export const HasGuardian = Template.bind({})
HasGuardian.args = {
  hasGuardian: true,
}

export const NoGuardian = Template.bind({})
NoGuardian.args = {
  hasGuardian: false,
}
