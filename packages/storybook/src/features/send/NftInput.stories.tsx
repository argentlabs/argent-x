import { NftInput } from "@argent-x/extension/src/ui/features/send/NftInput"
import { CellStack } from "@argent/ui"
import { ComponentProps } from "react"

export default {
  component: NftInput,
  parameters: {
    layout: "fullscreen",
  },
  render: (props: ComponentProps<typeof NftInput>) => (
    <CellStack>
      <NftInput {...props} />
    </CellStack>
  ),
}

export const Default = {
  args: {
    contractAddress:
      "0x03090623ea32d932ca1236595076b00702e7d860696faf300ca9eb13bfe0a78c",
    tokenId: "3462",
    networkId: "goerli-alpha",
  },
}

export const Briq = {
  args: {
    contractAddress:
      "0x0266b1276d23ffb53d99da3f01be7e29fa024dd33cd7f7b1eb7a46c67891c9d0",
    tokenId:
      "640905113789879694946220633234444814618850186205837930956157308831411470336",
    networkId: "goerli-alpha",
  },
}

export const StarknetID = {
  args: {
    contractAddress:
      "0x0798e884450c19e072d6620fefdbeb7387d0453d3fd51d95f5ace1f17633d88b",
    tokenId: "957339187530",
    networkId: "goerli-alpha",
  },
}
