import { ReviewRatingScreen } from "@argent-x/extension/src/ui/features/userReview/ReviewRatingScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"

export default {
  title: "features/ReviewRatingScreen",
  component: ReviewRatingScreen,
} as ComponentMeta<typeof ReviewRatingScreen>

const Template: ComponentStory<typeof ReviewRatingScreen> = (props) => (
  <MemoryRouter initialEntries={["/"]}>
    <ReviewRatingScreen {...props}></ReviewRatingScreen>
  </MemoryRouter>
)

export const Default = Template.bind({})
Default.args = {}
