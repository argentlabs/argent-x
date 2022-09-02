import { Call } from "starknet"
import { describe, expect, test } from "vitest"

import { Transaction } from "../../../../shared/transactions"
import { transformTransaction } from "../transform/transformTransaction"
import {
  erc20MintTestToken,
  erc20SwapAlphaRoad,
  erc20SwapJediswap,
  erc20SwapMySwap,
  erc20Transfer,
  erc721Transfer,
} from "./__fixtures__/transaction-calls/goerli-alpha"
import { tokensByNetwork } from "./tokensByNetwork"

const accountAddress =
  "0x5f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25"

const makeTransaction = (transactions: Call | Call[]): Transaction => {
  return {
    account: {
      address: accountAddress,
      network: {
        accountClassHash:
          "0x3e327de1c40540b98d05cbcb13552008e36f0ec8d61d46956d2f9752c294328",
        baseUrl: "https://alpha4.starknet.io",
        chainId: "SN_GOERLI",
        explorerUrl: "https://goerli.voyager.online",
        id: "goerli-alpha",
        multicallAddress:
          "0x042a12c5a641619a6c58e623d5735273cdfb0e13df72c4bacb4e188892034bd6",
        name: "Goerli Testnet",
        readonly: true,
      },
      networkId: "goerli-alpha",
      signer: {
        derivationPath: "m/44'/9004'/0'/0/0",
        type: "local_secret",
      },
    },
    hash: "0x535aa7c68e99011c090d3a2d277005dd9fe073ab6dc354a0c5d67f12505a5fc",
    meta: {
      transactions,
    },
    status: "ACCEPTED_ON_L2",
    timestamp: 1662047260,
  }
}

describe("transformTransaction", () => {
  describe("when valid", () => {
    test("should return the expected transformation", () => {
      /** erc20 transfer */
      expect(
        transformTransaction({
          transaction: makeTransaction(erc20Transfer),
          accountAddress,
          tokensByNetwork,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "TRANSFER",
          "amount": "1000000000000",
          "date": "2022-09-01T15:47:40.000Z",
          "displayName": "Transfer",
          "entity": "TOKEN",
          "fromAddress": "0x5f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
          "toAddress": "0x05417Fc252d9b7B6EA311485a9e946cC814E3AA4D00F740F7e5F6b11Ce0db9fa",
          "token": {
            "address": "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
            "decimals": 18,
            "image": "https://dv3jj1unlp2jl.cloudfront.net/128/color/eth.png",
            "name": "Ether",
            "network": "goerli-alpha",
            "networkId": "goerli-alpha",
            "showAlways": true,
            "symbol": "ETH",
          },
          "tokenAddress": "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        }
      `)

      /** erc20 mint */
      expect(
        transformTransaction({
          transaction: makeTransaction(erc20MintTestToken),
          accountAddress,
          tokensByNetwork,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "MINT",
          "amount": "1000000000000000000000",
          "date": "2022-09-01T15:47:40.000Z",
          "displayName": "Mint",
          "entity": "TOKEN",
          "fromAddress": "0x5f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
          "toAddress": "0x05F1f0a38429dcaB9FFD8A786c0d827e84C1CBd8f60243E6d25d066A13aF4a25",
          "token": {
            "address": "0x07394cbe418daa16e42b87ba67372d4ab4a5df0b05c6e554d158458ce245bc10",
            "decimals": 18,
            "name": "Test Token",
            "network": "goerli-alpha",
            "networkId": "goerli-alpha",
            "symbol": "TEST",
          },
          "tokenAddress": "0x07394cbe418daa16e42b87ba67372d4ab4a5df0b05c6e554d158458ce245bc10",
        }
      `)
    })
  })
  describe("when invalid", () => {
    test("should return undefined", () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(transformTransaction({})).toBeUndefined()
    })
  })
})
