import { IStatusMessage } from "@argent-x/extension/src/shared/statusMessage/types"
import { StatusMessageFullScreen } from "@argent-x/extension/src/ui/features/statusMessage/StatusMessageFullScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react"

import statusMessages from "./__fixtures__/status-messages.json"

export default {
  title: "features/StatusMessageFullScreen",
  component: StatusMessageFullScreen,
} as ComponentMeta<typeof StatusMessageFullScreen>

const Template: ComponentStory<typeof StatusMessageFullScreen> = (props) => (
  <StatusMessageFullScreen {...props}></StatusMessageFullScreen>
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
