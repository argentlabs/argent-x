import { ReviewFeedbackScreen } from "@argent-x/extension/src/ui/features/userReview/ReviewFeedbackScreen"
import type { StoryObj } from "@storybook/react"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: ReviewFeedbackScreen,
  decorators,
}

export const Stars1: StoryObj<typeof ReviewFeedbackScreen> = {
  args: {
    rating: 1,
    browserName: "Lorem Ipsum",
  },
}

export const Stars2: StoryObj<typeof ReviewFeedbackScreen> = {
  args: {
    rating: 2,
    browserName: "Lorem Ipsum",
  },
}

export const Stars3: StoryObj<typeof ReviewFeedbackScreen> = {
  args: {
    rating: 3,
    browserName: "Lorem Ipsum",
  },
}

export const Stars4: StoryObj<typeof ReviewFeedbackScreen> = {
  args: {
    rating: 4,
    browserName: "Lorem Ipsum",
  },
}

export const Stars5: StoryObj<typeof ReviewFeedbackScreen> = {
  args: {
    rating: 5,
    browserName: "Lorem Ipsum",
  },
}
