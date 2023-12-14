export const testDappSignature = {
  domain: {
    chainId: "SN_GOERLI",
    name: "Example DApp",
    version: "0.0.1",
  },
  message: {
    message: "some test",
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

export const dappLandPayload = {
  domain: {
    chainId: "SN_MAIN",
    name: "Dappland",
    version: "1.0",
  },
  message: {
    dappKey: "10kswap",
    rating: 4,
  },
  primaryType: "Message",
  types: {
    Message: [
      {
        name: "dappKey",
        type: "felt",
      },
      {
        name: "name",
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

export const unframedSignature = {
  domain: {
    chainId: "0x534e5f4d41494e",
    name: "Marketplace.maker_order",
    version: "1",
  },
  message: {
    additional_params: [],
    additional_params_len: 0,
    amount: {
      high: "0x0",
      low: "0x1",
    },
    collection:
      "0x03859bf9178b48a4ba330d6872ab5a6d3895b64d6631197beefde6293bc172cd",
    collection_type: 1,
    currency:
      "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    end_time: 1691653409,
    global_nonce: "0x0",
    limit_price: {
      high: "0x0",
      low: "0xb1a2bc2ec50000",
    },
    maker: "0x100bbcdc4d1232a0454339b8c4e945488348fa44160aa35d05853c67862da9c",
    max_fee: 1000,
    order_nonce:
      "0x1d31b5a4d34f8ff8bb2d60afe91e0e59d98822a1b1c2fa1e59c14fdb67d0544",
    side: 1,
    start_time: 1691048377,
    strategy:
      "0x012f3e256a78d411730c30d4ace443e31a59b1d48340d888d7aa198a2c4311f8",
    token_id: {
      high: "0x0",
      low: "0x8d",
    },
  },
  primaryType: "MakerOrder",
  types: {
    MakerOrder: [
      {
        name: "side",
        type: "felt",
      },
      {
        name: "maker",
        type: "felt",
      },
      {
        name: "collection",
        type: "felt",
      },
      {
        name: "collection_type",
        type: "felt",
      },
      {
        name: "limit_price",
        type: "u256",
      },
      {
        name: "token_id",
        type: "u256",
      },
      {
        name: "amount",
        type: "u256",
      },
      {
        name: "strategy",
        type: "felt",
      },
      {
        name: "currency",
        type: "felt",
      },
      {
        name: "global_nonce",
        type: "felt",
      },
      {
        name: "order_nonce",
        type: "felt",
      },
      {
        name: "start_time",
        type: "felt",
      },
      {
        name: "end_time",
        type: "felt",
      },
      {
        name: "max_fee",
        type: "felt",
      },
      {
        name: "additional_params_len",
        type: "felt",
      },
      {
        name: "additional_params",
        type: "felt*",
      },
    ],
    StarkNetDomain: [
      {
        name: "name",
        type: "felt",
      },
      {
        name: "version",
        type: "felt",
      },
      {
        name: "chainId",
        type: "felt",
      },
    ],
    u256: [
      {
        name: "low",
        type: "felt",
      },
      {
        name: "high",
        type: "felt",
      },
    ],
  },
}
