import { ReviewFeedbackScreen } from "@argent-x/extension/src/ui/features/userReview/ReviewFeedbackScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"

export default {
  title: "features/ReviewFeedbackScreen",
  component: ReviewFeedbackScreen,
} as ComponentMeta<typeof ReviewFeedbackScreen>

const Template: ComponentStory<typeof ReviewFeedbackScreen> = (props) => (
  <MemoryRouter initialEntries={["/"]}>
    <ReviewFeedbackScreen {...props}></ReviewFeedbackScreen>
  </MemoryRouter>
)

export const Default = Template.bind({})
Default.args = {}
