import { ApproveSignatureScreen } from "@argent-x/extension/src/ui/features/actions/ApproveSignatureScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: ApproveSignatureScreen,
  decorators,
  parameters: {
    layout: "fullscreen",
  },
}

export const Default = {
  args: {
    dataToSign: {
      domain: {
        chainId: "SN_GOERLI2",
        name: "Example DApp",
        version: "0.0.1",
      },
      message: {
        message:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lectus nisl, diam iaculis porttitor.",
      },
      primaryType: "Message",
      types: {
        Message: [
          {
            name: "message",
            type: "felt",
          },
        ],
        StarkNetDomain: [
          {
            name: "name",
            type: "felt",
          },
          {
            name: "chainId",
            type: "felt",
          },
          {
            name: "version",
            type: "felt",
          },
        ],
      },
    },
  },
}
