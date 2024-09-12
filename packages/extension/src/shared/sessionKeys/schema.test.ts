import { describe, expect, test } from "vitest"

import sessionMessage from "./__fixtures__/session-message.json"
import { isSessionKeyTypedData, sessionKeyMessageSchema } from "./schema"

describe("sessionKeys/schema", () => {
  describe("isSessionKeyTypedData", () => {
    test("identifies session key typed data", () => {
      expect(isSessionKeyTypedData(sessionMessage)).toBeTruthy()
    })
  })
  describe("sessionKeyMessageSchema", () => {
    test("parses session key message", () => {
      expect(
        sessionKeyMessageSchema.safeParse(sessionMessage.message).success,
      ).toBeTruthy()
    })
    test("parses session key message string to json", () => {
      expect(sessionKeyMessageSchema.parse(sessionMessage.message)).toEqual({
        "Allowed Methods": [
          {
            "Contract Address":
              "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
            selector: "transfer",
          },
        ],
        "Expires At": 1718722046,
        Metadata: {
          projectID: "test-dapp",
          txFees: [
            {
              maxAmount: "100000000000000000",
              tokenAddress:
                "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
            },
          ],
        },
        "Session Key":
          "0x05000d0fb7b4b8e10372de61efb762f62a92cbbfcc7b5e3492e05166f91b6175",
      })
    })
  })
})
