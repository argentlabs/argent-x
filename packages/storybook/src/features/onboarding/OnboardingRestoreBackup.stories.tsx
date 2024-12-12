import { Meta, StoryObj } from "@storybook/react"
import { OnboardingRestoreBackupScreen } from "@argent-x/extension/src/ui/features/onboarding/OnboardingRestoreBackupScreen"

const meta: Meta<typeof OnboardingRestoreBackupScreen> = {
  component: OnboardingRestoreBackupScreen,
}

export default meta

type Story = StoryObj<typeof OnboardingRestoreBackupScreen>

export const Default: Story = {
  args: {},
}
