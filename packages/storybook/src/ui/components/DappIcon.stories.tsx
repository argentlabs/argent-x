import { DappIcon } from "@argent-x/extension/src/ui/features/actions/connectDapp/DappIcon"
import { ComponentMeta, ComponentStory } from "@storybook/react"

export default {
  title: "components/DappIcon",
  component: DappIcon,
} as ComponentMeta<typeof DappIcon>

const Template: ComponentStory<typeof DappIcon> = (props) => (
  <div style={{ width: "100px", height: "100px" }}>
    <DappIcon {...props}></DappIcon>
  </div>
)

export const Default = Template.bind({})
Default.args = {
  host: "app.testnet.jediswap.xyz",
}

export const BitmapBox = Template.bind({})
BitmapBox.args = {
  host: "www.bitmapbox.xyz",
}

export const Briq = Template.bind({})
Briq.args = {
  host: "briq.construction",
}

export const MintSquare = Template.bind({})
MintSquare.args = {
  host: "mintsquare.io",
}
