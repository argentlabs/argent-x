import { ESCAPE_TYPE_SIGNER } from "@argent-x/extension/src/shared/account/details/getEscape"
import { EscapeSigner } from "@argent-x/extension/src/ui/features/shield/escape/EscapeSigner"
import { getActiveFromNow } from "@argent-x/extension/src/ui/features/shield/escape/useAccountEscape"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"

import { activeAt5d, activeAt5h, activeAt5m, activeAtNow } from "./activeAt"

export default {
  title: "shield/EscapeSigner",
  component: EscapeSigner,
} as ComponentMeta<typeof EscapeSigner>

const Template: ComponentStory<typeof EscapeSigner> = (props) => (
  <MemoryRouter initialEntries={["/"]}>
    <EscapeSigner {...props} />
  </MemoryRouter>
)

export const Signer5Days = Template.bind({})
Signer5Days.args = {
  liveAccountEscape: {
    activeAt: activeAt5d,
    type: ESCAPE_TYPE_SIGNER,
    ...getActiveFromNow(activeAt5d),
  },
}

export const Signer5Hours = Template.bind({})
Signer5Hours.args = {
  liveAccountEscape: {
    activeAt: activeAt5h,
    type: ESCAPE_TYPE_SIGNER,
    ...getActiveFromNow(activeAt5h),
  },
}

export const Signer5Minutes = Template.bind({})
Signer5Minutes.args = {
  liveAccountEscape: {
    activeAt: activeAt5m,
    type: ESCAPE_TYPE_SIGNER,
    ...getActiveFromNow(activeAt5m),
  },
}

export const SignerNow = Template.bind({})
SignerNow.args = {
  liveAccountEscape: {
    activeAt: activeAtNow,
    type: ESCAPE_TYPE_SIGNER,
    ...getActiveFromNow(activeAtNow),
  },
}
