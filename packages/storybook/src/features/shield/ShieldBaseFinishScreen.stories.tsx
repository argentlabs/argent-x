import { ShieldBaseFinishScreen } from "@argent-x/extension/src/ui/features/shield/ShieldBaseFinishScreen"
import { ChangeGuardian } from "@argent-x/extension/src/ui/features/shield/usePendingChangingGuardian"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"

export default {
  title: "shield/ShieldBaseFinishScreen",
  component: ShieldBaseFinishScreen,
} as ComponentMeta<typeof ShieldBaseFinishScreen>

const Template: ComponentStory<typeof ShieldBaseFinishScreen> = (props) => (
  <MemoryRouter initialEntries={["/"]}>
    <ShieldBaseFinishScreen {...props} />
  </MemoryRouter>
)

export const Removed = Template.bind({})
Removed.args = {
  accountName: "Account 1",
}

export const Adding = Template.bind({})
Adding.args = {
  accountName: "Account 1",
  pendingChangeGuardian: ChangeGuardian.ADDING,
}

export const Added = Template.bind({})
Added.args = {
  accountName: "Account 1",
  guardian: "0x123",
}

export const Removing = Template.bind({})
Removing.args = {
  accountName: "Account 1",
  pendingChangeGuardian: ChangeGuardian.REMOVING,
}
