import { Call } from "starknet"
import { describe, expect, test } from "vitest"

import { Transaction } from "../../../../../../shared/transactions"
import { nftContractAddresses } from "../../__test__/nftContractAddresses"
import { tokensByNetwork } from "../../__test__/tokensByNetwork"
import { transformTransaction } from "../transformTransaction"
import {
  changeGuardianAdd,
  changeGuardianRemove,
  erc20MintTestToken,
  erc20SwapAlphaRoad,
  erc20SwapJediswap,
  erc20SwapMySwap,
  erc20Transfer,
  erc721MintAspect,
  erc721Transfer,
} from "./__fixtures__/transaction-calls/goerli-alpha"

const accountAddress =
  "0x5f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25"

const makeTransaction = (transactions: Call | Call[]): Transaction => {
  return {
    account: {
      address: accountAddress,
      type: "standard",
      network: {
        accountClassHash: {
          standard:
            "0x389a968f62e344b2e08a50e091987797a74b34840840022fd797769230a9d3f",
        },
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
          nftContractAddresses,
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
          nftContractAddresses,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "MINT",
          "amount": "1000000000000000000000",
          "date": "2022-09-01T15:47:40.000Z",
          "displayName": "Mint",
          "entity": "TOKEN",
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

      /** erc721 transfer */
      expect(
        transformTransaction({
          transaction: makeTransaction(erc721Transfer),
          accountAddress,
          tokensByNetwork,
          nftContractAddresses,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "TRANSFER",
          "contractAddress": "0x03090623ea32d932ca1236595076b00702e7d860696faf300ca9eb13bfe0a78c",
          "date": "2022-09-01T15:47:40.000Z",
          "displayName": "Transfer NFT",
          "entity": "NFT",
          "fromAddress": "0x05F1f0a38429dcaB9FFD8A786c0d827e84C1CBd8f60243E6d25d066A13aF4a25",
          "toAddress": "0x05417Fc252d9b7B6EA311485a9e946cC814E3AA4D00F740F7e5F6b11Ce0db9fa",
          "tokenId": "4734",
        }
      `)

      /** dapps */
      expect(
        transformTransaction({
          transaction: makeTransaction(erc20SwapAlphaRoad),
          accountAddress,
          tokensByNetwork,
          nftContractAddresses,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "UNKNOWN",
          "dapp": {
            "hosts": [
              "testnet.app.alpharoad.fi",
            ],
            "id": "alpharoad-fi",
            "title": "Alpha Road",
          },
          "dappContractAddress": "0x4aec73f0611a9be0524e7ef21ab1679bdf9c97dc7d72614f15373d431226b6a",
          "date": "2022-09-01T15:47:40.000Z",
          "displayName": "Approve and swap exact tokens for tokens",
          "entity": "DAPP",
        }
      `)
      expect(
        transformTransaction({
          transaction: makeTransaction(erc20SwapJediswap),
          accountAddress,
          tokensByNetwork,
          nftContractAddresses,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "UNKNOWN",
          "dapp": {
            "hosts": [
              "app.testnet.jediswap.xyz",
            ],
            "id": "jediswap-xyz",
            "title": "JediSwap",
          },
          "dappContractAddress": "0x012b063b60553c91ed237d8905dff412fba830c5716b17821063176c6c073341",
          "date": "2022-09-01T15:47:40.000Z",
          "displayName": "Approve and swap exact tokens for tokens",
          "entity": "DAPP",
        }
      `)
      expect(
        transformTransaction({
          transaction: makeTransaction(erc20SwapMySwap),
          accountAddress,
          tokensByNetwork,
          nftContractAddresses,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "UNKNOWN",
          "dapp": {
            "hosts": [
              "www.myswap.xyz",
            ],
            "icon": "https://www.myswap.xyz/favicon.ico",
            "id": "myswap-xyz",
            "title": "mySwap",
          },
          "dappContractAddress": "0x018a439bcbb1b3535a6145c1dc9bc6366267d923f60a84bd0c7618f33c81d334",
          "date": "2022-09-01T15:47:40.000Z",
          "displayName": "Approve and swap",
          "entity": "DAPP",
        }
      `)
      expect(
        transformTransaction({
          transaction: makeTransaction(erc721MintAspect),
          accountAddress,
          tokensByNetwork,
          nftContractAddresses,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "UNKNOWN",
          "date": "2022-09-01T15:47:40.000Z",
          "displayName": "Mint",
          "entity": "UNKNOWN",
        }
      `)
      expect(
        transformTransaction({
          transaction: makeTransaction(changeGuardianAdd),
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "ADD",
          "date": "2022-09-01T15:47:40.000Z",
          "displayName": "Add Argent Shield",
          "entity": "GUARDIAN",
        }
      `)
      expect(
        transformTransaction({
          transaction: makeTransaction(changeGuardianRemove),
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "REMOVE",
          "date": "2022-09-01T15:47:40.000Z",
          "displayName": "Remove Argent Shield",
          "entity": "GUARDIAN",
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
