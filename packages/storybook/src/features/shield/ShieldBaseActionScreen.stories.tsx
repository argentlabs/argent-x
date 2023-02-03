import { ShieldBaseActionScreen } from "@argent-x/extension/src/ui/features/shield/ShieldBaseActionScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"

export default {
  title: "shield/ShieldBaseActionScreen",
  component: ShieldBaseActionScreen,
} as ComponentMeta<typeof ShieldBaseActionScreen>

const Template: ComponentStory<typeof ShieldBaseActionScreen> = (props) => (
  <MemoryRouter initialEntries={["/"]}>
    <ShieldBaseActionScreen {...props} />
  </MemoryRouter>
)

export const Add = Template.bind({})
Add.args = {}

export const Remove = Template.bind({})
Remove.args = {
  guardian: "0x123",
}
