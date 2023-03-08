import { ESCAPE_TYPE_GUARDIAN } from "@argent-x/extension/src/shared/account/details/getEscape"
import { EscapeGuardian } from "@argent-x/extension/src/ui/features/shield/escape/EscapeGuardian"
import { getActiveFromNow } from "@argent-x/extension/src/ui/features/shield/escape/useAccountEscape"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"

const activeAtNow = new Date().getTime() / 1000

const activeAt5m = activeAtNow + 60 * 5
const activeAt5h = activeAtNow + 60 * 60 * 5
const activeAt5d = activeAtNow + 24 * 60 * 60 * 5

export default {
  title: "shield/EscapeGuardian",
  component: EscapeGuardian,
} as ComponentMeta<typeof EscapeGuardian>

const Template: ComponentStory<typeof EscapeGuardian> = (props) => (
  <MemoryRouter initialEntries={["/"]}>
    <EscapeGuardian {...props} />
  </MemoryRouter>
)

export const Shield5Days = Template.bind({})
Shield5Days.args = {
  liveAccountEscape: {
    activeAt: activeAt5d,
    type: ESCAPE_TYPE_GUARDIAN,
    ...getActiveFromNow(activeAt5d),
  },
}

export const Shield5Hours = Template.bind({})
Shield5Hours.args = {
  liveAccountEscape: {
    activeAt: activeAt5h,
    type: ESCAPE_TYPE_GUARDIAN,
    ...getActiveFromNow(activeAt5h),
  },
}

export const Shield5Minutes = Template.bind({})
Shield5Minutes.args = {
  liveAccountEscape: {
    activeAt: activeAt5m,
    type: ESCAPE_TYPE_GUARDIAN,
    ...getActiveFromNow(activeAt5m),
  },
}
