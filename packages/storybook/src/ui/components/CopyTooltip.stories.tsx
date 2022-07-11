import { CopyTooltip } from "@argent-x/extension/src/ui/components/CopyTooltip"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import styled from "styled-components"

export default {
  title: "components/CopyTooltip",
  component: CopyTooltip,
} as ComponentMeta<typeof CopyTooltip>

const Template: ComponentStory<typeof CopyTooltip> = (props) => (
  <CopyTooltip {...props}></CopyTooltip>
)

const Message = styled.div`
  color: ${({ theme }) => theme.text1};
  cursor: pointer;
  text-align: center;
`

export const Default = Template.bind({})
Default.args = {
  message: "Copied",
  copyValue: "Will be copied to clipboard",
  children: <Message>Some content in here</Message>,
}
