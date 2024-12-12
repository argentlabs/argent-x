import { Meta, StoryObj } from "@storybook/react"
import { OnboardingToastMessage } from "@argent-x/extension/src/ui/features/onboarding/ui/OnboardingToastMessage"

const meta: Meta<typeof OnboardingToastMessage> = {
  component: OnboardingToastMessage,
}

export default meta

type Story = StoryObj<typeof OnboardingToastMessage>

export const Default: Story = {
  parameters: {
    viewport: {
      defaultViewport: "reset",
    },
  },
}
