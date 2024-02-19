import { StoryObj } from "@storybook/react"
import { AccountTokens } from "@argent-x/extension/src/ui/features/accountTokens/AccountTokens"

import { decorators } from "../../decorators/routerDecorators"
import { account } from "../../account"
import { Account } from "@argent-x/extension/src/ui/features/accounts/Account"

export default {
  component: AccountTokens,
  decorators,
  parameters: {
    layout: "fullscreen",
  },
}

export const SeedphraseBanner: StoryObj<typeof AccountTokens> = {
  args: {
    account: account as unknown as Account,
    showTokensAndBanners: true,
    showSaveRecoverySeedphraseBanner: true,
  },
}
