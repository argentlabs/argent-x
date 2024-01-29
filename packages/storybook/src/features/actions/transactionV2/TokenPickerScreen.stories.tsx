import { parsedDefaultTokens } from "@argent-x/extension/src/shared/token/__new/utils"
import { TokenPickerScreen } from "@argent-x/extension/src/ui/features/actions/feeEstimation/ui/TokenPickerScreen"
import { StoryObj } from "@storybook/react"

export default {
  component: TokenPickerScreen,
}

export const Default: StoryObj<typeof TokenPickerScreen> = {
  args: {
    tokens: parsedDefaultTokens
      .filter((x) => x.networkId === "mainnet-alpha")
      .map((token) => {
        const disabled = Math.random() < 0.2

        return {
          ...token,
          image: token.iconUrl,
          balance: BigInt(
            disabled
              ? 0
              : Math.floor(Math.random() * 10 ** token.decimals * 10) +
                  Math.floor(Math.random() * 10 ** (token.decimals - 3)),
          ),
        }
      }),
  },
}
