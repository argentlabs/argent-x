import { typedData } from "starknet"

export const dataToSign: typedData.TypedData = {
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
}
