import { BarBackButton, NavigationContainer } from "@argent/ui"
import { ComponentMeta, ComponentStory } from "@storybook/react"

export default {
  title: "components/NavigationContainer",
  component: NavigationContainer,
} as ComponentMeta<typeof NavigationContainer>

const onClick = () => console.log("onClick")

const Template: ComponentStory<typeof NavigationContainer> = (props) => (
  <NavigationContainer {...props}></NavigationContainer>
)

export const Default = Template.bind({})
Default.args = {
  title: "Title in here",
  leftButton: <BarBackButton onClick={onClick} />,
}
