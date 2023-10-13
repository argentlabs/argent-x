import { describe, expect, it } from "vitest"
import { determineMigrationNeededV581 } from "./v5.8.1"
import {
  cryptoStarknetServiceMock,
  getWalletStoreMock,
} from "../../wallet/test.utils"

describe("v5.8.1", () => {
  it("should detect falsey accounts for migration", async () => {
    const result = await determineMigrationNeededV581(
      cryptoStarknetServiceMock,
      getWalletStoreMock({
        get: vi.fn(() =>
          Promise.resolve([
            {
              address:
                "0x27391f566beb47c08442bf54748855f8ada5a645b2bc7eb2de1bcfc3849a0e5",
              name: "Account 1",
              needsDeploy: true,
              networkId: "mainnet-alpha",
              signer: {
                derivationPath: "m/44'/9004'/0'/0/0",
                type: "local_secret",
              },
              type: "standard",
            },
            {
              address:
                "0x27391f566beb47c08442bf54748855f8ada5a645b2bc7eb2de1bcfc3849a0e5",
              name: "Account 1",
              needsDeploy: false,
              networkId: "goerli-alpha",
              signer: {
                derivationPath: "m/44'/9004'/0'/0/0",
                type: "local_secret",
              },
              type: "standard",
            },
            {
              address:
                "0x522623bbfd34bada76d76f2d31ad294d2767a5890bf76d7aa0b8272df367ee5",
              name: "Account 2",
              needsDeploy: true,
              networkId: "goerli-alpha",
              signer: {
                derivationPath: "m/44'/9004'/0'/0/1",
                type: "local_secret",
              },
              type: "standard",
            },
          ]),
        ),
      }),
    )

    // this is the only falsey account, as it was created with v5.8.1
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "address": "0x522623bbfd34bada76d76f2d31ad294d2767a5890bf76d7aa0b8272df367ee5",
          "name": "Account 2",
          "needsDeploy": true,
          "networkId": "goerli-alpha",
          "signer": {
            "derivationPath": "m/44'/9004'/0'/0/1",
            "type": "local_secret",
          },
          "type": "standard",
        },
      ]
    `)
  })
})
