import { NftInput } from "@argent-x/extension/src/ui/features/send/NftInput"
import { CellStack } from "@argent/x-ui"
import { ComponentProps } from "react"

export default {
  component: NftInput,
  render: (props: ComponentProps<typeof NftInput>) => (
    <CellStack>
      <NftInput {...props} />
    </CellStack>
  ),
}

export const Default = {
  args: {
    contractAddress:
      "0x076503062d78f4481be03c9145022d6a4a71ec0719aa07756f79a2384dc7ef16",
    tokenId: "301777624821",
    networkId: "mainnet-alpha",
  },
}

export const Ducks = {
  args: {
    contractAddress:
      "0x04fa864a706e3403fd17ac8df307f22eafa21b778b73353abf69a622e47a2003",
    tokenId:
      "1281635805372597013751896252538071963445456258542422197850582165339926167555",
    networkId: "mainnet-alpha",
  },
}

export const StarknetID = {
  args: {
    contractAddress:
      "0x05dbdedc203e92749e2e746e2d40a768d966bd243df04a6b712e222bc040a9af",
    tokenId: "270127182426",
    networkId: "mainnet-alpha",
  },
}
