import { describe, expect, test } from "vitest"

import { IExplorerTransaction } from "../../../../../../shared/explorer/type"
import { transformExplorerTransaction } from "../transformExplorerTransaction"
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
  erc20TransferWithSequencerEvent,
  erc721MintAspect,
  erc721MintMintSquare,
  erc721Transfer,
} from "./__fixtures__/explorer-transactions/goerli-alpha"

describe("transformExplorerTransaction", () => {
  describe("when valid", () => {
    test("should return the expected transformation", () => {
      /** erc20 transfer */
      expect(
        transformExplorerTransaction({
          explorerTransaction: erc20Transfer as IExplorerTransaction,
          accountAddress: "0x0",
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "TRANSFER",
          "actualFee": "10089999979820",
          "amount": "1000000000000000",
          "date": "2022-08-18T11:50:28.000Z",
          "displayName": "Transfer",
          "entity": "TOKEN",
          "fromAddress": "0x5f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
          "maxFee": "15134999954595",
          "toAddress": "0x5417fc252d9b7b6ea311485a9e946cc814e3aa4d00f740f7e5f6b11ce0db9fa",
          "token": {
            "address": "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
            "decimals": 18,
            "image": "https://dv3jj1unlp2jl.cloudfront.net/128/color/eth.png",
            "name": "Ether",
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
          explorerTransaction:
            erc20TransferWithSequencerEvent as IExplorerTransaction,
          accountAddress: "0x0",
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "TRANSFER",
          "actualFee": "10089999979820",
          "amount": "1000000000000000",
          "date": "2022-08-18T11:50:28.000Z",
          "displayName": "Transfer",
          "entity": "TOKEN",
          "fromAddress": "0x5f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
          "maxFee": "15134999954595",
          "toAddress": "0x5417fc252d9b7b6ea311485a9e946cc814e3aa4d00f740f7e5f6b11ce0db9fa",
          "token": {
            "address": "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
            "decimals": 18,
            "image": "https://dv3jj1unlp2jl.cloudfront.net/128/color/eth.png",
            "name": "Ether",
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
          explorerTransaction: erc20Transfer as IExplorerTransaction,
          accountAddress:
            "0x5f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "SEND",
          "actualFee": "10089999979820",
          "amount": "1000000000000000",
          "date": "2022-08-18T11:50:28.000Z",
          "displayName": "Send",
          "entity": "TOKEN",
          "fromAddress": "0x5f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
          "maxFee": "15134999954595",
          "toAddress": "0x5417fc252d9b7b6ea311485a9e946cc814e3aa4d00f740f7e5f6b11ce0db9fa",
          "token": {
            "address": "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
            "decimals": 18,
            "image": "https://dv3jj1unlp2jl.cloudfront.net/128/color/eth.png",
            "name": "Ether",
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
          explorerTransaction: erc20Transfer as IExplorerTransaction,
          accountAddress:
            "0x5417fc252d9b7b6ea311485a9e946cc814e3aa4d00f740f7e5f6b11ce0db9fa",
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "RECEIVE",
          "actualFee": "10089999979820",
          "amount": "1000000000000000",
          "date": "2022-08-18T11:50:28.000Z",
          "displayName": "Receive",
          "entity": "TOKEN",
          "fromAddress": "0x5f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
          "maxFee": "15134999954595",
          "toAddress": "0x5417fc252d9b7b6ea311485a9e946cc814e3aa4d00f740f7e5f6b11ce0db9fa",
          "token": {
            "address": "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
            "decimals": 18,
            "image": "https://dv3jj1unlp2jl.cloudfront.net/128/color/eth.png",
            "name": "Ether",
            "network": "mainnet-alpha",
            "networkId": "mainnet-alpha",
            "showAlways": true,
            "symbol": "ETH",
          },
          "tokenAddress": "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
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
            "image": "https://dv3jj1unlp2jl.cloudfront.net/128/color/eth.png",
            "name": "Ether",
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
          "token": {
            "address": "0x07394cbe418daa16e42b87ba67372d4ab4a5df0b05c6e554d158458ce245bc10",
            "decimals": 18,
            "name": "Test Token",
            "network": "goerli-alpha",
            "networkId": "goerli-alpha",
            "symbol": "TEST",
          },
          "tokenAddress": "0x7394cbe418daa16e42b87ba67372d4ab4a5df0b05c6e554d158458ce245bc10",
        }
      `)

      /** erc721 mint */
      expect(
        transformExplorerTransaction({
          explorerTransaction: erc721MintAspect as IExplorerTransaction,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "MINT",
          "actualFee": "10580000000000",
          "contractAddress": "0x3090623ea32d932ca1236595076b00702e7d860696faf300ca9eb13bfe0a78c",
          "date": "2022-08-18T11:50:28.000Z",
          "displayName": "Mint NFT",
          "entity": "NFT",
          "maxFee": "15870000000000",
          "tokenId": "3462",
        }
      `)
      expect(
        transformExplorerTransaction({
          explorerTransaction: erc721MintMintSquare as IExplorerTransaction,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "MINT",
          "actualFee": "12404500000000",
          "contractAddress": "0x2f13075210b7252c826eafdc09d9d77ef272f582947f7adbd44ef79eae0062c",
          "date": "2022-08-18T11:50:28.000Z",
          "displayName": "Mint NFT",
          "entity": "NFT",
          "maxFee": "18606750037213",
          "tokenId": "45416",
        }
      `)

      /** erc721 transfer */
      expect(
        transformExplorerTransaction({
          explorerTransaction: erc721Transfer as IExplorerTransaction,
          accountAddress: "0x0",
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "TRANSFER",
          "actualFee": "20494725109306",
          "contractAddress": "0x25c1d0a3cfab1f5464b2e6a38c91c89bea77397744a7eb24b3f3645108d4abb",
          "date": "2022-08-18T11:50:28.000Z",
          "displayName": "Transfer NFT",
          "entity": "NFT",
          "fromAddress": "0x5f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
          "maxFee": "30742087663959",
          "toAddress": "0x5417fc252d9b7b6ea311485a9e946cc814e3aa4d00f740f7e5f6b11ce0db9fa",
          "tokenId": "143",
        }
      `)
      expect(
        transformExplorerTransaction({
          explorerTransaction: erc721Transfer as IExplorerTransaction,
          accountAddress:
            "0x5417fc252d9b7b6ea311485a9e946cc814e3aa4d00f740f7e5f6b11ce0db9fa",
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "RECEIVE",
          "actualFee": "20494725109306",
          "contractAddress": "0x25c1d0a3cfab1f5464b2e6a38c91c89bea77397744a7eb24b3f3645108d4abb",
          "date": "2022-08-18T11:50:28.000Z",
          "displayName": "Receive NFT",
          "entity": "NFT",
          "fromAddress": "0x5f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
          "maxFee": "30742087663959",
          "toAddress": "0x5417fc252d9b7b6ea311485a9e946cc814e3aa4d00f740f7e5f6b11ce0db9fa",
          "tokenId": "143",
        }
      `)
      expect(
        transformExplorerTransaction({
          explorerTransaction: erc721Transfer as IExplorerTransaction,
          accountAddress:
            "0x5f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "SEND",
          "actualFee": "20494725109306",
          "contractAddress": "0x25c1d0a3cfab1f5464b2e6a38c91c89bea77397744a7eb24b3f3645108d4abb",
          "date": "2022-08-18T11:50:28.000Z",
          "displayName": "Send NFT",
          "entity": "NFT",
          "fromAddress": "0x5f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
          "maxFee": "30742087663959",
          "toAddress": "0x5417fc252d9b7b6ea311485a9e946cc814e3aa4d00f740f7e5f6b11ce0db9fa",
          "tokenId": "143",
        }
      `)

      /** account */
      expect(
        transformExplorerTransaction({
          explorerTransaction: accountCreated as IExplorerTransaction,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "CREATE",
          "date": "2022-08-18T11:50:28.000Z",
          "displayName": "Create acount",
          "entity": "ACCOUNT",
        }
      `)
      expect(
        transformExplorerTransaction({
          explorerTransaction: accountCreatedAlt as IExplorerTransaction,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "CREATE",
          "date": "2022-08-25T10:35:52.000Z",
          "displayName": "Create acount",
          "entity": "ACCOUNT",
        }
      `)
      expect(
        transformExplorerTransaction({
          explorerTransaction: accountUpgrade as IExplorerTransaction,
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
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "SWAP",
          "actualFee": "49915215635677",
          "dapp": {
            "hosts": [
              "testnet.app.alpharoad.fi",
            ],
            "id": "alpharoad-fi",
            "title": "Alpha Road",
          },
          "dappContractAddress": "0x4aec73f0611a9be0524e7ef21ab1679bdf9c97dc7d72614f15373d431226b6a",
          "date": "2022-08-18T11:50:28.000Z",
          "displayName": "Sold ETH for unknown",
          "entity": "TOKEN",
          "fromAmount": "211522156930263",
          "fromToken": {
            "address": "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
            "decimals": 18,
            "image": "https://dv3jj1unlp2jl.cloudfront.net/128/color/eth.png",
            "name": "Ether",
            "network": "mainnet-alpha",
            "networkId": "mainnet-alpha",
            "showAlways": true,
            "symbol": "ETH",
          },
          "fromTokenAddress": "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          "maxFee": "70744313503497",
          "toAmount": "55785188096947612154",
          "toTokenAddress": "0x72df4dc5b6c4df72e4288857317caf2ce9da166ab8719ab8306516a2fddfff7",
        }
      `)
      expect(
        transformExplorerTransaction({
          explorerTransaction: erc20SwapJediswap as IExplorerTransaction,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "SWAP",
          "actualFee": "36750992760053",
          "dapp": {
            "hosts": [
              "app.testnet.jediswap.xyz",
            ],
            "id": "jediswap-xyz",
            "title": "Jediswap",
          },
          "dappContractAddress": "0x12b063b60553c91ed237d8905dff412fba830c5716b17821063176c6c073341",
          "date": "2022-08-18T11:50:28.000Z",
          "displayName": "Sold ETH for USDC",
          "entity": "TOKEN",
          "fromAmount": "1000000000000000",
          "fromToken": {
            "address": "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
            "decimals": 18,
            "image": "https://dv3jj1unlp2jl.cloudfront.net/128/color/eth.png",
            "name": "Ether",
            "network": "mainnet-alpha",
            "networkId": "mainnet-alpha",
            "showAlways": true,
            "symbol": "ETH",
          },
          "fromTokenAddress": "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          "maxFee": "55126489140079",
          "toAmount": "9883",
          "toToken": {
            "address": "0x005a643907b9a4bc6a55e9069c4fd5fd1f5c79a22470690f75556c4736e34426",
            "decimals": 6,
            "image": "https://dv3jj1unlp2jl.cloudfront.net/128/color/usdc.png",
            "name": "USD Coin",
            "network": "goerli-alpha",
            "networkId": "goerli-alpha",
            "symbol": "USDC",
          },
          "toTokenAddress": "0x5a643907b9a4bc6a55e9069c4fd5fd1f5c79a22470690f75556c4736e34426",
        }
      `)
      expect(
        transformExplorerTransaction({
          explorerTransaction: erc20SwapMySwap as IExplorerTransaction,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "SWAP",
          "actualFee": "35172000035172",
          "dapp": {
            "hosts": [
              "www.myswap.xyz",
            ],
            "icon": "https://www.myswap.xyz/favicon.ico",
            "id": "myswap-xyz",
            "title": "mySwap",
          },
          "dappContractAddress": "0x18a439bcbb1b3535a6145c1dc9bc6366267d923f60a84bd0c7618f33c81d334",
          "date": "2022-08-18T11:50:28.000Z",
          "displayName": "Sold ETH for DAI",
          "entity": "TOKEN",
          "fromAmount": "100000000000000",
          "fromToken": {
            "address": "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
            "decimals": 18,
            "image": "https://dv3jj1unlp2jl.cloudfront.net/128/color/eth.png",
            "name": "Ether",
            "network": "mainnet-alpha",
            "networkId": "mainnet-alpha",
            "showAlways": true,
            "symbol": "ETH",
          },
          "fromTokenAddress": "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          "maxFee": "52758000052758",
          "toAmount": "29852496290917474",
          "toToken": {
            "address": "0x03e85bfbb8e2a42b7bead9e88e9a1b19dbccf661471061807292120462396ec9",
            "decimals": 18,
            "image": "https://dv3jj1unlp2jl.cloudfront.net/128/color/dai.png",
            "name": "DAI",
            "network": "goerli-alpha",
            "networkId": "goerli-alpha",
            "symbol": "DAI",
          },
          "toTokenAddress": "0x3e85bfbb8e2a42b7bead9e88e9a1b19dbccf661471061807292120462396ec9",
        }
      `)

      /** buy NFT */
      expect(
        transformExplorerTransaction({
          explorerTransaction: dappAspectBuyNft as IExplorerTransaction,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "BUY",
          "actualFee": "18270500000000",
          "contractAddress": "0x3090623ea32d932ca1236595076b00702e7d860696faf300ca9eb13bfe0a78c",
          "dapp": {
            "hosts": [
              "aspect.co",
              "testnet.aspect.co",
            ],
            "icon": "https://aspect.co/img/company/logo512.png",
            "id": "aspect-co",
            "title": "Aspect",
          },
          "dappContractAddress": "0x6fcf30a53fdc33c85ab428d6c481c5d241f1de403009c4e5b66aeaf3edc890",
          "date": "2022-08-18T11:50:28.000Z",
          "displayName": "Buy NFT",
          "entity": "NFT",
          "maxFee": "27405750000000",
          "tokenId": "3462",
        }
      `)
      expect(
        transformExplorerTransaction({
          explorerTransaction: dappMintSquareBuyNft as IExplorerTransaction,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "BUY",
          "actualFee": "17222000000000",
          "contractAddress": "0x3090623ea32d932ca1236595076b00702e7d860696faf300ca9eb13bfe0a78c",
          "dapp": {
            "hosts": [
              "mintsquare.io",
            ],
            "id": "mintsquare-io",
            "title": "Mint Square",
          },
          "dappContractAddress": "0x5bc8cc601c5098e20e9d9d74e86cfb0ec737f6f3ac571914dbe4f74aa249786",
          "date": "2022-08-18T11:50:28.000Z",
          "displayName": "Buy NFT",
          "entity": "NFT",
          "maxFee": "25832999948334",
          "tokenId": "3462",
        }
      `)
      expect(
        transformExplorerTransaction({
          explorerTransaction:
            dappInfluenceCrewmatePurchaseNft as IExplorerTransaction,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "BUY",
          "actualFee": "4557033777702",
          "contractAddress": "0x41c4e86a03480313547a04e13fc4d43d7fb7bcb5244fd0cb93f793f304f6124",
          "dapp": {
            "hosts": [
              "game-goerli.influenceth.io",
            ],
            "icon": "https://uploads-ssl.webflow.com/60c209ffee9cc9e89d505549/60c8fea5c9d9a170d2f9b5e0_logo-256.png",
            "id": "influenceth-io",
            "title": "Influence",
          },
          "dappContractAddress": "0x4a472fe795cc40e9dc838fe4f1608cb91bf027854d016675ec81e172a2e3599",
          "date": "2022-08-31T10:55:59.000Z",
          "displayName": "Buy NFT",
          "entity": "NFT",
          "maxFee": "7742757880620",
          "tokenId": "9099",
        }
      `)

      /** novel dapps */
      expect(
        transformExplorerTransaction({
          explorerTransaction: dappNoGame as IExplorerTransaction,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "UNKNOWN",
          "actualFee": "13666550163999",
          "dapp": {
            "hosts": [
              "nogamev0-1.netlify.app",
            ],
            "id": "nogame-app",
            "title": "NoGame",
          },
          "dappContractAddress": "0x35401b96dc690eda2716068d3b03732d7c18af7c0327787660179108789d84f",
          "date": "2022-08-18T11:50:28.000Z",
          "displayName": "Crystal upgrade complete",
          "entity": "DAPP",
          "maxFee": "20499825245998",
        }
      `)
      expect(
        transformExplorerTransaction({
          explorerTransaction: dappBriq as IExplorerTransaction,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "UNKNOWN",
          "actualFee": "17607000123249",
          "dapp": {
            "hosts": [
              "briq.construction",
            ],
            "id": "briq-construction",
            "title": "briq",
          },
          "dappContractAddress": "0x1317354276941f7f799574c73fd8fe53fa3f251084b4c04d88cf601b6bd915e",
          "date": "2022-08-18T11:50:28.000Z",
          "displayName": "Assemble",
          "entity": "DAPP",
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
