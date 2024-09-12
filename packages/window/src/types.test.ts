import { describe, expect, test } from "vitest"
import { z } from "zod"

import { StarknetMethodArgumentsSchemas } from "./types"

const message: z.infer<typeof StarknetMethodArgumentsSchemas.signMessage> = [
  {
    domain: {
      name: "Example DApp",
      chainId: "SN_GOERLI",
      version: "0.0.1",
    },
    types: {
      StarkNetDomain: [
        { name: "name", type: "felt" },
        { name: "chainId", type: "felt" },
        { name: "version", type: "felt" },
      ],
      Message: [{ name: "message", type: "felt" }],
    },
    primaryType: "Message",
    message: {
      message: "Lorem ipsum dolor",
    },
  },
]

const baseMessage = [
  {
    types: {
      StarkNetDomain: [
        { name: "name", type: "felt" },
        { name: "version", type: "felt" },
        { name: "chainId", type: "felt" },
      ],
      Person: [
        { name: "name", type: "felt" },
        { name: "wallet", type: "felt" },
      ],
      Mail: [
        { name: "from", type: "Person" },
        { name: "to", type: "Person" },
        { name: "contents", type: "felt" },
      ],
    },
    primaryType: "Mail",
    domain: {
      name: "StarkNet Mail",
      version: "1",
      chainId: 1,
    },
    message: {
      from: {
        name: "Cow",
        wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
      },
      to: {
        name: "Bob",
        wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
      },
      contents: "Hello, Bob!",
    },
  },
]

const baseTypesMessage = [
  {
    types: {
      StarknetDomain: [
        { name: "name", type: "shortstring" },
        { name: "version", type: "shortstring" },
        { name: "chainId", type: "shortstring" },
        { name: "revision", type: "shortstring" },
      ],
      Example: [
        { name: "n0", type: "felt" },
        { name: "n1", type: "bool" },
        { name: "n2", type: "string" },
        { name: "n3", type: "selector" },
        { name: "n4", type: "u128" },
        { name: "n5", type: "i128" },
        { name: "n6", type: "ContractAddress" },
        { name: "n7", type: "ClassHash" },
        { name: "n8", type: "timestamp" },
        { name: "n9", type: "shortstring" },
      ],
    },
    primaryType: "Example",
    domain: {
      name: "StarkNet Mail",
      version: "1",
      chainId: "1",
      revision: "1",
    },
    message: {
      n0: "0x3e8",
      n1: true,
      n2: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      n3: "transfer",
      n4: 10,
      n5: -10,
      n6: "0x3e8",
      n7: "0x3e8",
      n8: 1000,
      n9: "transfer",
    },
  },
]

const enumMessage = [
  {
    types: {
      StarknetDomain: [
        { name: "name", type: "shortstring" },
        { name: "version", type: "shortstring" },
        { name: "chainId", type: "shortstring" },
        { name: "revision", type: "shortstring" },
      ],
      Example: [{ name: "someEnum", type: "enum", contains: "MyEnum" }],
      MyEnum: [
        { name: "Variant 1", type: "()" },
        { name: "Variant 2", type: "(u128,u128*)" },
        { name: "Variant 3", type: "(u128)" },
      ],
    },
    primaryType: "Example",
    domain: {
      name: "StarkNet Mail",
      version: "1",
      chainId: "1",
      revision: "1",
    },
    message: {
      someEnum: {
        "Variant 2": [2, [0, 1]],
      },
    },
  },
]

const presetTypesMessage = [
  {
    types: {
      StarknetDomain: [
        { name: "name", type: "shortstring" },
        { name: "version", type: "shortstring" },
        { name: "chainId", type: "shortstring" },
        { name: "revision", type: "shortstring" },
      ],
      Example: [
        { name: "n0", type: "TokenAmount" },
        { name: "n1", type: "NftId" },
      ],
    },
    primaryType: "Example",
    domain: {
      name: "StarkNet Mail",
      version: "1",
      chainId: "1",
      revision: "1",
    },
    message: {
      n0: {
        token_address:
          "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        amount: {
          low: "0x3e8",
          high: "0x0",
        },
      },
      n1: {
        collection_address:
          "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        token_id: {
          low: "0x3e8",
          high: "0x0",
        },
      },
    },
  },
]

const structArrayMessage = [
  {
    types: {
      StarkNetDomain: [
        { name: "name", type: "felt" },
        { name: "version", type: "felt" },
        { name: "chainId", type: "felt" },
      ],
      Person: [
        { name: "name", type: "felt" },
        { name: "wallet", type: "felt" },
      ],
      Post: [
        { name: "title", type: "felt" },
        { name: "content", type: "felt" },
      ],
      Mail: [
        { name: "from", type: "Person" },
        { name: "to", type: "Person" },
        { name: "posts_len", type: "felt" },
        { name: "posts", type: "Post*" },
      ],
    },
    primaryType: "Mail",
    domain: {
      name: "StarkNet Mail",
      version: "1",
      chainId: 1,
    },
    message: {
      from: {
        name: "Cow",
        wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
      },
      to: {
        name: "Bob",
        wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
      },
      posts_len: 2,
      posts: [
        { title: "Greeting", content: "Hello, Bob!" },
        { title: "Farewell", content: "Goodbye, Bob!" },
      ],
    },
  },
]

const merkleTreeMessage = [
  {
    primaryType: "Session",
    types: {
      Policy: [
        { name: "contractAddress", type: "felt" },
        { name: "selector", type: "selector" },
      ],
      Session: [
        { name: "key", type: "felt" },
        { name: "expires", type: "felt" },
        { name: "root", type: "merkletree", contains: "Policy" },
      ],
      StarkNetDomain: [
        { name: "name", type: "felt" },
        { name: "version", type: "felt" },
        { name: "chain_id", type: "felt" },
      ],
    },
    domain: {
      name: "StarkNet Mail",
      version: "1",
      chain_id: 1,
    },
    message: {
      key: "0x0000000000000000000000000000000000000000000000000000000000000000",
      expires:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      root: [
        {
          contractAddress: "0x1",
          selector: "transfer",
        },
        {
          contractAddress: "0x2",
          selector: "transfer",
        },
        {
          contractAddress: "0x3",
          selector: "transfer",
        },
      ],
    },
  },
]

const hybridSessionKeysMessage = [
  {
    types: {
      StarknetDomain: [
        { name: "name", type: "shortstring" },
        { name: "version", type: "shortstring" },
        { name: "chainI", type: "shortstring" },
        { name: "revision", type: "shortstring" },
      ],
      "Allowed Method": [
        { name: "Contract Address", type: "ContractAddress" },
        { name: "selector", type: "selector" },
      ],
      Session: [
        { name: "Expires At", type: "timestamp" },
        {
          name: "Allowed Methods",
          type: "merkletree",
          contains: "Allowed Method",
        },
        { name: "Metadata", type: "string" },
        { name: "Session Key", type: "felt" },
      ],
    },
    primaryType: "Session",
    domain: {
      name: "SessionAccount.session",
      version: "1",
      chainId: "SN_SEPOLIA",
      revision: "1",
    },
    message: {
      "Expires At": "117090256870",
      "Allowed Methods": [
        {
          "Contract Address":
            "0x3f68e12789ace09d195ba1a587550c19dbd665b7bd82da33b08ac83123db652",
          selector: "set_number_double",
        },
      ],
      Metadata:
        "{ 'projectID': '123456', 'maxFee': 1000000000000, 'feeToken': 'STRK', 'tokenLimits' : { '0x989898989' : 9999999999 } }",
      "Session Key":
        "2543707029695183230146761574221281240112511463954890350766793321580039814416",
    },
  },
]

describe("types", () => {
  describe("typedDataSchema", () => {
    describe("when valid", () => {
      test("should return valid for a base types message", async () => {
        const result =
          await StarknetMethodArgumentsSchemas.signMessage.parseAsync(
            baseTypesMessage,
          )
        expect(result).toMatchInlineSnapshot(`
          [
            {
              "domain": {
                "chainId": "1",
                "name": "StarkNet Mail",
                "revision": "1",
                "version": "1",
              },
              "message": {
                "n0": "0x3e8",
                "n1": true,
                "n2": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                "n3": "transfer",
                "n4": 10,
                "n5": -10,
                "n6": "0x3e8",
                "n7": "0x3e8",
                "n8": 1000,
                "n9": "transfer",
              },
              "primaryType": "Example",
              "types": {
                "Example": [
                  {
                    "name": "n0",
                    "type": "felt",
                  },
                  {
                    "name": "n1",
                    "type": "bool",
                  },
                  {
                    "name": "n2",
                    "type": "string",
                  },
                  {
                    "name": "n3",
                    "type": "selector",
                  },
                  {
                    "name": "n4",
                    "type": "u128",
                  },
                  {
                    "name": "n5",
                    "type": "i128",
                  },
                  {
                    "name": "n6",
                    "type": "ContractAddress",
                  },
                  {
                    "name": "n7",
                    "type": "ClassHash",
                  },
                  {
                    "name": "n8",
                    "type": "timestamp",
                  },
                  {
                    "name": "n9",
                    "type": "shortstring",
                  },
                ],
                "StarknetDomain": [
                  {
                    "name": "name",
                    "type": "shortstring",
                  },
                  {
                    "name": "version",
                    "type": "shortstring",
                  },
                  {
                    "name": "chainId",
                    "type": "shortstring",
                  },
                  {
                    "name": "revision",
                    "type": "shortstring",
                  },
                ],
              },
            },
          ]
        `)
      })
      test("should return valid for a preset types message", async () => {
        const result =
          await StarknetMethodArgumentsSchemas.signMessage.parseAsync(
            presetTypesMessage,
          )
        expect(result).toMatchInlineSnapshot(`
          [
            {
              "domain": {
                "chainId": "1",
                "name": "StarkNet Mail",
                "revision": "1",
                "version": "1",
              },
              "message": {
                "n0": {
                  "amount": {
                    "high": "0x0",
                    "low": "0x3e8",
                  },
                  "token_address": "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
                },
                "n1": {
                  "collection_address": "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
                  "token_id": {
                    "high": "0x0",
                    "low": "0x3e8",
                  },
                },
              },
              "primaryType": "Example",
              "types": {
                "Example": [
                  {
                    "name": "n0",
                    "type": "TokenAmount",
                  },
                  {
                    "name": "n1",
                    "type": "NftId",
                  },
                ],
                "StarknetDomain": [
                  {
                    "name": "name",
                    "type": "shortstring",
                  },
                  {
                    "name": "version",
                    "type": "shortstring",
                  },
                  {
                    "name": "chainId",
                    "type": "shortstring",
                  },
                  {
                    "name": "revision",
                    "type": "shortstring",
                  },
                ],
              },
            },
          ]
        `)
      })
      test("should return valid for a struct array message message", async () => {
        const result =
          await StarknetMethodArgumentsSchemas.signMessage.parseAsync(
            structArrayMessage,
          )
        expect(result).toMatchInlineSnapshot(`
          [
            {
              "domain": {
                "chainId": 1,
                "name": "StarkNet Mail",
                "version": "1",
              },
              "message": {
                "from": {
                  "name": "Cow",
                  "wallet": "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
                },
                "posts": [
                  {
                    "content": "Hello, Bob!",
                    "title": "Greeting",
                  },
                  {
                    "content": "Goodbye, Bob!",
                    "title": "Farewell",
                  },
                ],
                "posts_len": 2,
                "to": {
                  "name": "Bob",
                  "wallet": "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
                },
              },
              "primaryType": "Mail",
              "types": {
                "Mail": [
                  {
                    "name": "from",
                    "type": "Person",
                  },
                  {
                    "name": "to",
                    "type": "Person",
                  },
                  {
                    "name": "posts_len",
                    "type": "felt",
                  },
                  {
                    "name": "posts",
                    "type": "Post*",
                  },
                ],
                "Person": [
                  {
                    "name": "name",
                    "type": "felt",
                  },
                  {
                    "name": "wallet",
                    "type": "felt",
                  },
                ],
                "Post": [
                  {
                    "name": "title",
                    "type": "felt",
                  },
                  {
                    "name": "content",
                    "type": "felt",
                  },
                ],
                "StarkNetDomain": [
                  {
                    "name": "name",
                    "type": "felt",
                  },
                  {
                    "name": "version",
                    "type": "felt",
                  },
                  {
                    "name": "chainId",
                    "type": "felt",
                  },
                ],
              },
            },
          ]
        `)
      })
      test("should return valid for a merkle tree message", async () => {
        const result =
          await StarknetMethodArgumentsSchemas.signMessage.parseAsync(
            merkleTreeMessage,
          )
        expect(result).toMatchInlineSnapshot(`
          [
            {
              "domain": {
                "chain_id": 1,
                "name": "StarkNet Mail",
                "version": "1",
              },
              "message": {
                "expires": "0x0000000000000000000000000000000000000000000000000000000000000000",
                "key": "0x0000000000000000000000000000000000000000000000000000000000000000",
                "root": [
                  {
                    "contractAddress": "0x1",
                    "selector": "transfer",
                  },
                  {
                    "contractAddress": "0x2",
                    "selector": "transfer",
                  },
                  {
                    "contractAddress": "0x3",
                    "selector": "transfer",
                  },
                ],
              },
              "primaryType": "Session",
              "types": {
                "Policy": [
                  {
                    "name": "contractAddress",
                    "type": "felt",
                  },
                  {
                    "name": "selector",
                    "type": "selector",
                  },
                ],
                "Session": [
                  {
                    "name": "key",
                    "type": "felt",
                  },
                  {
                    "name": "expires",
                    "type": "felt",
                  },
                  {
                    "contains": "Policy",
                    "name": "root",
                    "type": "merkletree",
                  },
                ],
                "StarkNetDomain": [
                  {
                    "name": "name",
                    "type": "felt",
                  },
                  {
                    "name": "version",
                    "type": "felt",
                  },
                  {
                    "name": "chain_id",
                    "type": "felt",
                  },
                ],
              },
            },
          ]
        `)
      })
      test("should return valid for an enum message", async () => {
        const result =
          await StarknetMethodArgumentsSchemas.signMessage.parseAsync(
            enumMessage,
          )
        expect(result).toMatchInlineSnapshot(`
          [
            {
              "domain": {
                "chainId": "1",
                "name": "StarkNet Mail",
                "revision": "1",
                "version": "1",
              },
              "message": {
                "someEnum": {
                  "Variant 2": [
                    2,
                    [
                      0,
                      1,
                    ],
                  ],
                },
              },
              "primaryType": "Example",
              "types": {
                "Example": [
                  {
                    "contains": "MyEnum",
                    "name": "someEnum",
                    "type": "enum",
                  },
                ],
                "MyEnum": [
                  {
                    "name": "Variant 1",
                    "type": "()",
                  },
                  {
                    "name": "Variant 2",
                    "type": "(u128,u128*)",
                  },
                  {
                    "name": "Variant 3",
                    "type": "(u128)",
                  },
                ],
                "StarknetDomain": [
                  {
                    "name": "name",
                    "type": "shortstring",
                  },
                  {
                    "name": "version",
                    "type": "shortstring",
                  },
                  {
                    "name": "chainId",
                    "type": "shortstring",
                  },
                  {
                    "name": "revision",
                    "type": "shortstring",
                  },
                ],
              },
            },
          ]
        `)
      })
      test("should return valid for a hybrid session key message", async () => {
        const result =
          await StarknetMethodArgumentsSchemas.signMessage.parseAsync(
            hybridSessionKeysMessage,
          )
        expect(result).toMatchInlineSnapshot(`
          [
            {
              "domain": {
                "chainId": "SN_SEPOLIA",
                "name": "SessionAccount.session",
                "revision": "1",
                "version": "1",
              },
              "message": {
                "Allowed Methods": [
                  {
                    "Contract Address": "0x3f68e12789ace09d195ba1a587550c19dbd665b7bd82da33b08ac83123db652",
                    "selector": "set_number_double",
                  },
                ],
                "Expires At": "117090256870",
                "Metadata": "{ 'projectID': '123456', 'maxFee': 1000000000000, 'feeToken': 'STRK', 'tokenLimits' : { '0x989898989' : 9999999999 } }",
                "Session Key": "2543707029695183230146761574221281240112511463954890350766793321580039814416",
              },
              "primaryType": "Session",
              "types": {
                "Allowed Method": [
                  {
                    "name": "Contract Address",
                    "type": "ContractAddress",
                  },
                  {
                    "name": "selector",
                    "type": "selector",
                  },
                ],
                "Session": [
                  {
                    "name": "Expires At",
                    "type": "timestamp",
                  },
                  {
                    "contains": "Allowed Method",
                    "name": "Allowed Methods",
                    "type": "merkletree",
                  },
                  {
                    "name": "Metadata",
                    "type": "string",
                  },
                  {
                    "name": "Session Key",
                    "type": "felt",
                  },
                ],
                "StarknetDomain": [
                  {
                    "name": "name",
                    "type": "shortstring",
                  },
                  {
                    "name": "version",
                    "type": "shortstring",
                  },
                  {
                    "name": "chainI",
                    "type": "shortstring",
                  },
                  {
                    "name": "revision",
                    "type": "shortstring",
                  },
                ],
              },
            },
          ]
        `)
      })
      test("should return valid for a base message", async () => {
        const result =
          await StarknetMethodArgumentsSchemas.signMessage.parseAsync(
            baseMessage,
          )
        expect(result).toMatchInlineSnapshot(`
          [
            {
              "domain": {
                "chainId": 1,
                "name": "StarkNet Mail",
                "version": "1",
              },
              "message": {
                "contents": "Hello, Bob!",
                "from": {
                  "name": "Cow",
                  "wallet": "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
                },
                "to": {
                  "name": "Bob",
                  "wallet": "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
                },
              },
              "primaryType": "Mail",
              "types": {
                "Mail": [
                  {
                    "name": "from",
                    "type": "Person",
                  },
                  {
                    "name": "to",
                    "type": "Person",
                  },
                  {
                    "name": "contents",
                    "type": "felt",
                  },
                ],
                "Person": [
                  {
                    "name": "name",
                    "type": "felt",
                  },
                  {
                    "name": "wallet",
                    "type": "felt",
                  },
                ],
                "StarkNetDomain": [
                  {
                    "name": "name",
                    "type": "felt",
                  },
                  {
                    "name": "version",
                    "type": "felt",
                  },
                  {
                    "name": "chainId",
                    "type": "felt",
                  },
                ],
              },
            },
          ]
        `)
      })
      test("should return valid", async () => {
        const result =
          await StarknetMethodArgumentsSchemas.signMessage.parseAsync(message)
        expect(result).toMatchInlineSnapshot(`
          [
            {
              "domain": {
                "chainId": "SN_GOERLI",
                "name": "Example DApp",
                "version": "0.0.1",
              },
              "message": {
                "message": "Lorem ipsum dolor",
              },
              "primaryType": "Message",
              "types": {
                "Message": [
                  {
                    "name": "message",
                    "type": "felt",
                  },
                ],
                "StarkNetDomain": [
                  {
                    "name": "name",
                    "type": "felt",
                  },
                  {
                    "name": "chainId",
                    "type": "felt",
                  },
                  {
                    "name": "version",
                    "type": "felt",
                  },
                ],
              },
            },
          ]
        `)
      })
    })
  })
})
