import { ButtonCell, CellStack, HeaderCell, SpacerCell } from "@argent/ui"
import { ComponentMeta, ComponentStory } from "@storybook/react"

export default {
  title: "components/CellStack",
  component: CellStack,
  parameters: {
    viewport: {
      defaultViewport: "reset",
    },
  },
} as ComponentMeta<typeof CellStack>

const Template: ComponentStory<typeof CellStack> = (props) => (
  <CellStack {...props}>
    <HeaderCell>HeaderCell</HeaderCell>
    <ButtonCell>ButtonCell</ButtonCell>
    <ButtonCell>ButtonCell</ButtonCell>
    <HeaderCell>HeaderCell</HeaderCell>
    <ButtonCell>ButtonCell</ButtonCell>
    <ButtonCell>ButtonCell</ButtonCell>
    <ButtonCell color={"error.500"}>ButtonCell with color</ButtonCell>
    <SpacerCell />
    <ButtonCell>ButtonCell</ButtonCell>
    <ButtonCell>ButtonCell</ButtonCell>
    <ButtonCell>ButtonCell</ButtonCell>
  </CellStack>
)

export const Default = Template.bind({})
Default.args = {}
