import { VerifiedDappBanner } from "@argent-x/extension/src/ui/features/actions/transaction/ApproveTransactionScreen/VerifiedDappBanner"
import { ComponentMeta, ComponentStory } from "@storybook/react"

export default {
  title: "features/VerifiedDappBanner",
  component: VerifiedDappBanner,
} as ComponentMeta<typeof VerifiedDappBanner>

const Template: ComponentStory<typeof VerifiedDappBanner> = (props) => (
  <VerifiedDappBanner {...props}></VerifiedDappBanner>
)

const jediswap = {
  name: "JediSwap",
  description:
    "A community-led fully permissionless and composable AMM on Starknet.",
  iconUrl: "https://www.dappland.com/dapps/jediswap/dapp-icon-jediswap.png",
  links: [
    {
      name: "twitter",
      url: "https://twitter.com/jediswap",
      position: 2,
    },
    {
      name: "website",
      url: "https://jediswap.xyz/",
      position: 1,
    },
    {
      name: "discord",
      url: "https://discord.gg/jediswap",
      position: 3,
    },
  ],
}

export const Default = Template.bind({})
Default.args = {
  dapp: jediswap,
}
