import { ESCAPE_TYPE_GUARDIAN } from "@argent-x/extension/src/shared/account/details/getEscape"
import { EscapeGuardian } from "@argent-x/extension/src/ui/features/shield/escape/EscapeGuardian"
import { getActiveFromNow } from "@argent-x/extension/src/ui/features/shield/escape/useAccountEscape"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"

import { activeAt5d, activeAt5h, activeAt5m, activeAtNow } from "./activeAt"

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

export const ShieldNow = Template.bind({})
ShieldNow.args = {
  liveAccountEscape: {
    activeAt: activeAtNow,
    type: ESCAPE_TYPE_GUARDIAN,
    ...getActiveFromNow(activeAtNow),
  },
}
