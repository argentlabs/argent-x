import { DappIcon } from "@argent-x/extension/src/ui/features/actions/connectDapp/DappIcon"
import { ComponentProps } from "react"

export default {
  component: DappIcon,
}

export const Default = {
  render: (props: ComponentProps<typeof DappIcon>) => (
    <DappIcon size={24} {...props}></DappIcon>
  ),
  args: {
    host: "app.testnet.jediswap.xyz",
  },
}

export const BitmapBox = {
  ...Default,
  args: {
    host: "www.bitmapbox.xyz",
  },
}

export const Briq = {
  ...Default,
  args: {
    host: "briq.construction",
  },
}
