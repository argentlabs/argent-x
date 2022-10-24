import { RecoverySetupScreen } from "@argent-x/extension/src/ui/features/recovery/RecoverySetupScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"

export default {
  title: "features/RecoverySetupScreen",
  component: RecoverySetupScreen,
} as ComponentMeta<typeof RecoverySetupScreen>

const Template: ComponentStory<typeof RecoverySetupScreen> = (props) => (
  <MemoryRouter initialEntries={["/"]}>
    <RecoverySetupScreen {...props}></RecoverySetupScreen>
  </MemoryRouter>
)

export const Default = Template.bind({})
Default.args = {}
