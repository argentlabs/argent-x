import { LockScreen } from "@argent-x/extension/src/ui/features/lock/LockScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"

export default {
  title: "features/LockScreen",
  component: LockScreen,
} as ComponentMeta<typeof LockScreen>

const Template: ComponentStory<typeof LockScreen> = (props) => (
  <MemoryRouter initialEntries={["/"]}>
    <LockScreen {...props}></LockScreen>
  </MemoryRouter>
)

export const Default = Template.bind({})
Default.args = {}
