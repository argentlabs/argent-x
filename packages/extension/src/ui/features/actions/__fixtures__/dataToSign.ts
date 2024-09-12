import { TypedData } from "@starknet-io/types-js"

export const dataToSign: TypedData = {
  domain: {
    chainId: "SN_SEPOLIA",
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
