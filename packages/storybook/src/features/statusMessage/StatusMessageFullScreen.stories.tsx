import { IStatusMessage } from "@argent-x/extension/src/shared/statusMessage/types"
import { StatusMessageBanner } from "@argent-x/extension/src/ui/features/statusMessage/StatusMessageBanner"
import { ComponentMeta, ComponentStory } from "@storybook/react"

import statusMessages from "./__fixtures__/status-messages.json"

export default {
  title: "features/StatusMessageBanner",
  component: StatusMessageBanner,
} as ComponentMeta<typeof StatusMessageBanner>

const Template: ComponentStory<typeof StatusMessageBanner> = (props) => (
  <StatusMessageBanner {...props}></StatusMessageBanner>
)

export const Danger = Template.bind({})
Danger.args = {
  statusMessage: statusMessages.danger as IStatusMessage,
}

export const Warn = Template.bind({})
Warn.args = {
  statusMessage: statusMessages.warn as IStatusMessage,
}

export const Info = Template.bind({})
Info.args = {
  statusMessage: statusMessages.info as IStatusMessage,
}

export const Null = Template.bind({})
Null.args = {
  statusMessage: statusMessages.null as IStatusMessage,
}
