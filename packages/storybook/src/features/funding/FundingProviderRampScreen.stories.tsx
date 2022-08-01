import { FundingProviderRampScreen } from "@argent-x/extension/src/ui/features/funding/FundingProviderRampScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"
import styled from "styled-components"

export default {
  title: "features/FundingProviderRampScreen",
  component: FundingProviderRampScreen,
} as ComponentMeta<typeof FundingProviderRampScreen>

const Container = styled.div`
  width: 300px;
  height: 600px;
`

const Template: ComponentStory<typeof FundingProviderRampScreen> = (props) => (
  <MemoryRouter initialEntries={["/"]}>
    <Container>
      <FundingProviderRampScreen {...props}></FundingProviderRampScreen>
    </Container>
  </MemoryRouter>
)

export const Default = Template.bind({})
Default.args = {}
