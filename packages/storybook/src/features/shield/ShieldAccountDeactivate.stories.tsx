import { ShieldAccountDeactivate } from "@argent-x/extension/src/ui/features/shield/ShieldAccountDeactivate"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"

export default {
  title: "shield/ShieldAccountDeactivate",
  component: ShieldAccountDeactivate,
} as ComponentMeta<typeof ShieldAccountDeactivate>

const Template: ComponentStory<typeof ShieldAccountDeactivate> = (props) => (
  <MemoryRouter initialEntries={["/"]}>
    <ShieldAccountDeactivate {...props} />
  </MemoryRouter>
)

export const Default = Template.bind({})
Default.args = {}
