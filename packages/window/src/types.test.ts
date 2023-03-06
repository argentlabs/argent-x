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

describe("types", () => {
  describe("typedDataSchema", () => {
    describe("when valid", () => {
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
