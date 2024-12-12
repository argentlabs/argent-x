import { Meta, StoryObj } from "@storybook/react"
import { OnboardingScreen } from "@argent-x/extension/src/ui/features/onboarding/ui/OnboardingScreen"

const meta: Meta<typeof OnboardingScreen> = {
  component: OnboardingScreen,
}

export default meta

type Story = StoryObj<typeof OnboardingScreen>

export const Default: Story = {
  args: {
    title: "Title lorem ipsum",
    subtitle: "Subtitle dolor sit amet",
    length: 10,
    currentIndex: 3,
  },
}
