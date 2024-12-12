import { describe, expect, test } from "vitest"

import type { IExplorerTransaction } from "../../../../explorer/type"
import { nftContractAddresses } from "../__fixtures__/nftContractAddresses"
import { tokensByNetwork } from "../__fixtures__/tokensByNetwork"
import { transformExplorerTransaction } from "./transformExplorerTransaction"
import {
  accountCreated,
  accountCreatedAlt,
  accountUpgrade,
  dappAspectBuyNft,
  dappBriq,
  dappInfluenceCrewmatePurchaseNft,
  dappMintSquareBuyNft,
  dappNoGame,
  erc20ApproveUnlimited,
  erc20MintTestToken,
  erc20SwapAlphaRoad,
  erc20SwapJediswap,
  erc20SwapMySwap,
  erc20Transfer,
  erc20TransferNoContractAddress,
  erc20TransferNoEvents,
  erc20TransferWithSequencerEvent,
  erc721MintAspect,
  erc721MintMintSquare,
  erc721Transfer,
} from "./__fixtures__/explorer-transactions/sepolia-alpha"

describe("transformExplorerTransaction", () => {
  describe("when valid", () => {
    test("should return the expected transformation", () => {
      /** erc20 transfer */
      expect(
        transformExplorerTransaction({
          explorerTransaction: erc20Transfer as IExplorerTransaction,
          accountAddress: "0x0",
          tokensByNetwork,
          nftContractAddresses,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "TRANSFER",
          "actualFee": "10089999979820",
          "amount": "1000000000000000",
          "date": "2022-08-18T11:50:28.000Z",
          "displayName": "Transfer",
          "entity": "TOKEN",
          "fromAddress": "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
          "maxFee": "15134999954595",
          "toAddress": "0x69b49c2cc8b16e80e86bfc5b0614a59aa8c9b601569c7b80dde04d3f3151b79",
          "token": {
            "address": "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
            "decimals": 18,
            "iconUrl": "https://dv3jj1unlp2jl.cloudfront.net/128/color/eth.png",
            "id": 1,
            "name": "Ethereum",
            "network": "sepolia-alpha",
            "networkId": "sepolia-alpha",
            "showAlways": true,
            "symbol": "ETH",
          },
          "tokenAddress": "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        }
      `)
      expect(
        transformExplorerTransaction({
          explorerTransaction:
            erc20TransferWithSequencerEvent as IExplorerTransaction,
          accountAddress: "0x0",
          tokensByNetwork,
          nftContractAddresses,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "TRANSFER",
          "actualFee": "10089999979820",
          "amount": "1000000000000000",
          "date": "2022-08-18T11:50:28.000Z",
          "displayName": "Transfer",
          "entity": "TOKEN",
          "fromAddress": "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
          "maxFee": "15134999954595",
          "toAddress": "0x69b49c2cc8b16e80e86bfc5b0614a59aa8c9b601569c7b80dde04d3f3151b79",
          "token": {
            "address": "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
            "decimals": 18,
            "iconUrl": "https://dv3jj1unlp2jl.cloudfront.net/128/color/eth.png",
            "id": 1,
            "name": "Ethereum",
            "network": "sepolia-alpha",
            "networkId": "sepolia-alpha",
            "showAlways": true,
            "symbol": "ETH",
          },
          "tokenAddress": "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        }
      `)
      expect(
        transformExplorerTransaction({
          explorerTransaction: erc20Transfer as IExplorerTransaction,
          accountAddress:
            "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
          tokensByNetwork,
          nftContractAddresses,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "SEND",
          "actualFee": "10089999979820",
          "amount": "1000000000000000",
          "date": "2022-08-18T11:50:28.000Z",
          "displayName": "Send",
          "entity": "TOKEN",
          "fromAddress": "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
          "maxFee": "15134999954595",
          "toAddress": "0x69b49c2cc8b16e80e86bfc5b0614a59aa8c9b601569c7b80dde04d3f3151b79",
          "token": {
            "address": "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
            "decimals": 18,
            "iconUrl": "https://dv3jj1unlp2jl.cloudfront.net/128/color/eth.png",
            "id": 1,
            "name": "Ethereum",
            "network": "sepolia-alpha",
            "networkId": "sepolia-alpha",
            "showAlways": true,
            "symbol": "ETH",
          },
          "tokenAddress": "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        }
      `)
      expect(
        transformExplorerTransaction({
          explorerTransaction: erc20Transfer as IExplorerTransaction,
          accountAddress:
            "0x69b49c2cc8b16e80e86bfc5b0614a59aa8c9b601569c7b80dde04d3f3151b79",
          tokensByNetwork,
          nftContractAddresses,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "RECEIVE",
          "actualFee": "10089999979820",
          "amount": "1000000000000000",
          "date": "2022-08-18T11:50:28.000Z",
          "displayName": "Receive",
          "entity": "TOKEN",
          "fromAddress": "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
          "maxFee": "15134999954595",
          "toAddress": "0x69b49c2cc8b16e80e86bfc5b0614a59aa8c9b601569c7b80dde04d3f3151b79",
          "token": {
            "address": "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
            "decimals": 18,
            "iconUrl": "https://dv3jj1unlp2jl.cloudfront.net/128/color/eth.png",
            "id": 1,
            "name": "Ethereum",
            "network": "sepolia-alpha",
            "networkId": "sepolia-alpha",
            "showAlways": true,
            "symbol": "ETH",
          },
          "tokenAddress": "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        }
      `)
      expect(
        transformExplorerTransaction({
          explorerTransaction:
            erc20TransferNoContractAddress as IExplorerTransaction,
          accountAddress:
            "0x5b359ca70e7a4c4c6d33fbdab52a3db4c5a4228a811af4ff965b7a77329eebb",
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "RECEIVE",
          "actualFee": "519409707096",
          "amount": "461478497624608933",
          "date": "2022-12-22T08:59:55.000Z",
          "displayName": "Receive",
          "entity": "TOKEN",
          "fromAddress": "0x77fec0db5632a3bd9a3ba7cbf4e0a8578c1220b9f4d40d4d9adbad149debce2",
          "maxFee": "1558260783764",
          "toAddress": "0x5b359ca70e7a4c4c6d33fbdab52a3db4c5a4228a811af4ff965b7a77329eebb",
          "token": {
            "address": "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
            "decimals": 18,
            "iconUrl": "https://dv3jj1unlp2jl.cloudfront.net/128/color/eth.png",
            "id": 1,
            "name": "Ethereum",
            "network": "mainnet-alpha",
            "networkId": "mainnet-alpha",
            "showAlways": true,
            "symbol": "ETH",
          },
          "tokenAddress": "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        }
      `)
      expect(
        transformExplorerTransaction({
          explorerTransaction: erc20TransferNoEvents as IExplorerTransaction,
          accountAddress:
            "0x6edf9f7045ae05ba00bee5fbc3224d526735b7f10351a51f4c295f3c5b6da21",
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "SEND",
          "actualFee": "15571701038740",
          "amount": "100000000000000000000",
          "displayName": "Send",
          "entity": "TOKEN",
          "fromAddress": "0x6edf9f7045ae05ba00bee5fbc3224d526735b7f10351a51f4c295f3c5b6da21",
          "maxFee": "23357551558110",
          "toAddress": "0x1530359354ca4c9d2584cd45ff21fb8a257b90dc1abdd593172b2fb9c223e94",
          "tokenAddress": "0x7394cbe418daa16e42b87ba67372d4ab4a5df0b05c6e554d158458ce245bc10",
        }
      `)

      /** erc20 approve */
      expect(
        transformExplorerTransaction({
          explorerTransaction: erc20ApproveUnlimited as IExplorerTransaction,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "APPROVE",
          "actualFee": "78640023328647",
          "amount": "115792089237316195423570985008687907853269984665640564039457584007913129639935",
          "date": "2022-09-07T08:56:31.000Z",
          "displayName": "Approve",
          "entity": "TOKEN",
          "maxFee": "235920069985940",
          "spenderAddress": "0x2a92f0f860bf7c63fb9ef42cff4137006b309e0e6e1484e42d0b5511959414d",
          "token": {
            "address": "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
            "decimals": 18,
            "iconUrl": "https://dv3jj1unlp2jl.cloudfront.net/128/color/eth.png",
            "id": 1,
            "name": "Ethereum",
            "network": "mainnet-alpha",
            "networkId": "mainnet-alpha",
            "showAlways": true,
            "symbol": "ETH",
          },
          "tokenAddress": "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        }
      `)

      /** erc20 mint */
      expect(
        transformExplorerTransaction({
          explorerTransaction: erc20MintTestToken as IExplorerTransaction,
          tokensByNetwork,
          nftContractAddresses,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "MINT",
          "actualFee": "5019500010039",
          "amount": "1000000000000000000000",
          "date": "2022-08-18T11:50:28.000Z",
          "displayName": "Mint",
          "entity": "TOKEN",
          "maxFee": "7529250015058",
          "tokenAddress": "0x7394cbe418daa16e42b87ba67372d4ab4a5df0b05c6e554d158458ce245bc10",
        }
      `)

      /** erc721 mint */
      expect(
        transformExplorerTransaction({
          explorerTransaction: erc721MintAspect as IExplorerTransaction,
          tokensByNetwork,
          nftContractAddresses,
          accountAddress:
            "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "MINT",
          "actualFee": "10580000000000",
          "contractAddress": "0x3090623ea32d932ca1236595076b00702e7d860696faf300ca9eb13bfe0a78c",
          "date": "2022-08-18T11:50:28.000Z",
          "displayName": "Mint NFT",
          "entity": "NFT",
          "fromAddress": "0x0",
          "maxFee": "15870000000000",
          "toAddress": "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
          "tokenId": "3462",
        }
      `)
      expect(
        transformExplorerTransaction({
          explorerTransaction: erc721MintMintSquare as IExplorerTransaction,
          tokensByNetwork,
          nftContractAddresses,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "TRANSFER",
          "actualFee": "12404500000000",
          "contractAddress": "0x07861c4e276294a7e859ff0ae2eec0c68300ad9cbb43219db907da9bad786488",
          "date": "2022-08-18T11:50:28.000Z",
          "displayName": "Transfer NFT",
          "entity": "NFT",
          "fromAddress": "0x0",
          "maxFee": "18606750037213",
          "toAddress": "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
          "tokenId": "45416",
        }
      `)

      /** erc721 transfer */
      expect(
        transformExplorerTransaction({
          explorerTransaction: erc721Transfer as IExplorerTransaction,
          accountAddress: "0x0",
          tokensByNetwork,
          nftContractAddresses,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "TRANSFER",
          "actualFee": "81748141466442",
          "contractAddress": "0x3090623ea32d932ca1236595076b00702e7d860696faf300ca9eb13bfe0a78c",
          "date": "2022-09-29T10:02:23.000Z",
          "displayName": "Transfer NFT",
          "entity": "NFT",
          "fromAddress": "0x69b49c2cc8b16e80e86bfc5b0614a59aa8c9b601569c7b80dde04d3f3151b79",
          "maxFee": "372489156285048",
          "toAddress": "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
          "tokenId": "9240",
        }
      `)
      expect(
        transformExplorerTransaction({
          explorerTransaction: erc721Transfer as IExplorerTransaction,
          accountAddress:
            "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
          tokensByNetwork,
          nftContractAddresses,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "RECEIVE",
          "actualFee": "81748141466442",
          "contractAddress": "0x3090623ea32d932ca1236595076b00702e7d860696faf300ca9eb13bfe0a78c",
          "date": "2022-09-29T10:02:23.000Z",
          "displayName": "Receive NFT",
          "entity": "NFT",
          "fromAddress": "0x69b49c2cc8b16e80e86bfc5b0614a59aa8c9b601569c7b80dde04d3f3151b79",
          "maxFee": "372489156285048",
          "toAddress": "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
          "tokenId": "9240",
        }
      `)
      expect(
        transformExplorerTransaction({
          explorerTransaction: erc721Transfer as IExplorerTransaction,
          accountAddress:
            "0x69b49c2cc8b16e80e86bfc5b0614a59aa8c9b601569c7b80dde04d3f3151b79",
          tokensByNetwork,
          nftContractAddresses,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "SEND",
          "actualFee": "81748141466442",
          "contractAddress": "0x3090623ea32d932ca1236595076b00702e7d860696faf300ca9eb13bfe0a78c",
          "date": "2022-09-29T10:02:23.000Z",
          "displayName": "Send NFT",
          "entity": "NFT",
          "fromAddress": "0x69b49c2cc8b16e80e86bfc5b0614a59aa8c9b601569c7b80dde04d3f3151b79",
          "maxFee": "372489156285048",
          "toAddress": "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
          "tokenId": "9240",
        }
      `)

      /** account */
      expect(
        transformExplorerTransaction({
          explorerTransaction: accountCreated as IExplorerTransaction,
          tokensByNetwork,
          nftContractAddresses,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "CREATE",
          "date": "2022-08-18T11:50:28.000Z",
          "displayName": "Create account",
          "entity": "ACCOUNT",
        }
      `)
      expect(
        transformExplorerTransaction({
          explorerTransaction: accountCreatedAlt as IExplorerTransaction,
          tokensByNetwork,
          nftContractAddresses,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "CREATE",
          "date": "2022-08-25T10:35:52.000Z",
          "displayName": "Create account",
          "entity": "ACCOUNT",
        }
      `)
      expect(
        transformExplorerTransaction({
          explorerTransaction: accountUpgrade as IExplorerTransaction,
          tokensByNetwork,
          nftContractAddresses,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "UPGRADE",
          "actualFee": "3831400030652",
          "date": "2022-08-18T11:50:28.000Z",
          "displayName": "Upgrade account",
          "entity": "ACCOUNT",
          "maxFee": "6000000000000",
        }
      `)

      /** erc20 swap */
      expect(
        transformExplorerTransaction({
          explorerTransaction: erc20SwapAlphaRoad as IExplorerTransaction,
          tokensByNetwork,
          nftContractAddresses,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "UNKNOWN",
          "actualFee": "49915215635677",
          "date": "2022-08-18T11:50:28.000Z",
          "displayName": "Approve and swap exact tokens for tokens",
          "entity": "UNKNOWN",
          "maxFee": "70744313503497",
        }
      `)
      expect(
        transformExplorerTransaction({
          explorerTransaction: erc20SwapJediswap as IExplorerTransaction,
          tokensByNetwork,
          nftContractAddresses,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "UNKNOWN",
          "actualFee": "36750992760053",
          "date": "2022-08-18T11:50:28.000Z",
          "displayName": "Approve and swap exact tokens for tokens",
          "entity": "UNKNOWN",
          "maxFee": "55126489140079",
        }
      `)
      expect(
        transformExplorerTransaction({
          explorerTransaction: erc20SwapMySwap as IExplorerTransaction,
          tokensByNetwork,
          nftContractAddresses,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "UNKNOWN",
          "actualFee": "35172000035172",
          "date": "2022-08-18T11:50:28.000Z",
          "displayName": "Approve",
          "entity": "UNKNOWN",
          "maxFee": "52758000052758",
        }
      `)

      /** buy NFT */
      expect(
        transformExplorerTransaction({
          explorerTransaction: dappAspectBuyNft as IExplorerTransaction,
          tokensByNetwork,
          nftContractAddresses,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "TRANSFER",
          "actualFee": "18270500000000",
          "contractAddress": "0x3090623ea32d932ca1236595076b00702e7d860696faf300ca9eb13bfe0a78c",
          "date": "2022-08-18T11:50:28.000Z",
          "displayName": "Transfer NFT",
          "entity": "NFT",
          "fromAddress": "0x69b49c2cc8b16e80e86bfc5b0614a59aa8c9b601569c7b80dde04d3f3151b79",
          "maxFee": "27405750000000",
          "toAddress": "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
          "tokenId": "3462",
        }
      `)
      expect(
        transformExplorerTransaction({
          explorerTransaction: dappMintSquareBuyNft as IExplorerTransaction,
          tokensByNetwork,
          nftContractAddresses,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "TRANSFER",
          "actualFee": "17222000000000",
          "contractAddress": "0x3090623ea32d932ca1236595076b00702e7d860696faf300ca9eb13bfe0a78c",
          "date": "2022-08-18T11:50:28.000Z",
          "displayName": "Transfer NFT",
          "entity": "NFT",
          "fromAddress": "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
          "maxFee": "25832999948334",
          "toAddress": "0x69b49c2cc8b16e80e86bfc5b0614a59aa8c9b601569c7b80dde04d3f3151b79",
          "tokenId": "3462",
        }
      `)
      expect(
        transformExplorerTransaction({
          explorerTransaction:
            dappInfluenceCrewmatePurchaseNft as IExplorerTransaction,
          tokensByNetwork,
          nftContractAddresses,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "UNKNOWN",
          "actualFee": "4557033777702",
          "date": "2022-08-31T10:55:59.000Z",
          "displayName": "Approve",
          "entity": "UNKNOWN",
          "maxFee": "7742757880620",
        }
      `)

      /** novel dapps */
      expect(
        transformExplorerTransaction({
          explorerTransaction: dappNoGame as IExplorerTransaction,
          tokensByNetwork,
          nftContractAddresses,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "UNKNOWN",
          "actualFee": "13666550163999",
          "date": "2022-08-18T11:50:28.000Z",
          "displayName": "Crystal upgrade complete",
          "entity": "UNKNOWN",
          "maxFee": "20499825245998",
        }
      `)
      expect(
        transformExplorerTransaction({
          explorerTransaction: dappBriq as IExplorerTransaction,
          tokensByNetwork,
          nftContractAddresses,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "UNKNOWN",
          "actualFee": "17607000123249",
          "date": "2022-08-18T11:50:28.000Z",
          "displayName": "Assemble",
          "entity": "UNKNOWN",
          "maxFee": "26410500211284",
        }
      `)
    })
  })
  describe("when invalid", () => {
    test("should return undefined", () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(transformExplorerTransaction({})).toBeUndefined()
    })
  })
})
