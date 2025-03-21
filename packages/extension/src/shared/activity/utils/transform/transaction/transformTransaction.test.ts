import type { Call } from "starknet"
import { describe, expect, test } from "vitest"

import type { Transaction } from "../../../../transactions"
import { nftContractAddresses } from "../__fixtures__/nftContractAddresses"
import { tokensByNetwork } from "../__fixtures__/tokensByNetwork"
import { transformTransaction } from "./transformTransaction"

import { ETH_TOKEN_ADDRESS } from "../../../../network/constants"
import { SignerType } from "../../../../wallet.model"

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
  multisigAddOwner,
  multisigRemoveOwner,
  multisigReplaceOwner,
  rejectOnChain,
} from "../../../../call/__fixtures__/transaction-calls/sepolia-alpha"
import { getAccountIdentifier } from "../../../../utils/accountIdentifier"
import { getMockSigner } from "../../../../../../test/signer.mock"

export const accountAddress =
  "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a"

const id = getAccountIdentifier(
  accountAddress,
  "sepolia-alpha",
  getMockSigner(),
)

export const makeTransaction = (transactions: Call | Call[]): Transaction => {
  return {
    account: {
      id,
      name: "Account 1",
      address: accountAddress,
      type: "standard",
      network: {
        accountClassHash: {
          standard:
            "0x389a968f62e344b2e08a50e091987797a74b34840840022fd797769230a9d3f",
        },
        rpcUrl: "https://starknet-testnet.public.blastapi.io",
        chainId: "SN_SEPOLIA",
        explorerUrl: "https://sepolia.voyager.online",
        id: "sepolia-alpha",
        multicallAddress:
          "0x042a12c5a641619a6c58e623d5735273cdfb0e13df72c4bacb4e188892034bd6",
        name: "sepolia Testnet",
        possibleFeeTokenAddresses: [ETH_TOKEN_ADDRESS],
        readonly: true,
      },
      networkId: "sepolia-alpha",
      signer: {
        derivationPath: "m/44'/9004'/0'/0/0",
        type: SignerType.LOCAL_SECRET,
      },
    },
    hash: "0x535aa7c68e99011c090d3a2d277005dd9fe073ab6dc354a0c5d67f12505a5fc",
    meta: {
      transactions,
    },
    status: {
      finality_status: "RECEIVED",
    },
    timestamp: 1662047260,
  }
}

export const makeMultisigTransaction = (
  transactions: Call | Call[],
): Transaction => {
  const tx = makeTransaction(transactions)
  tx.account.type = "multisig"
  return tx
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
          "displayName": "Send",
          "entity": "TOKEN",
          "fromAddress": "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
          "toAddress": "0x05417Fc252d9b7B6EA311485a9e946cC814E3AA4D00F740F7e5F6b11Ce0db9fa",
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
          "date": "2022-09-01T15:47:40.000Z",
          "displayName": "Approve and swap exact tokens for tokens",
          "entity": "UNKNOWN",
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
          "date": "2022-09-01T15:47:40.000Z",
          "displayName": "Approve and swap exact tokens for tokens",
          "entity": "UNKNOWN",
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
          "date": "2022-09-01T15:47:40.000Z",
          "displayName": "Approve and swap",
          "entity": "UNKNOWN",
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
          "displayName": "Add Guardian",
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
          "displayName": "Remove Guardian",
          "entity": "GUARDIAN",
        }
      `)

      expect(
        transformTransaction({
          transaction: makeTransaction(multisigAddOwner),
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "ADD",
          "date": "2022-09-01T15:47:40.000Z",
          "displayName": "Add signers",
          "entity": "SIGNER",
        }
      `)

      expect(
        transformTransaction({
          transaction: makeTransaction(multisigRemoveOwner),
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "REMOVE",
          "date": "2022-09-01T15:47:40.000Z",
          "displayName": "Remove signers",
          "entity": "SIGNER",
        }
      `)

      expect(
        transformTransaction({
          transaction: makeTransaction(multisigReplaceOwner),
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "REPLACE",
          "date": "2022-09-01T15:47:40.000Z",
          "displayName": "Replace signer",
          "entity": "SIGNER",
        }
      `)

      expect(
        transformTransaction({
          transaction: makeMultisigTransaction(rejectOnChain),
          accountAddress,
        }),
      ).toMatchInlineSnapshot(`
        {
          "action": "REJECT_ON_CHAIN",
          "date": "2022-09-01T15:47:40.000Z",
          "displayName": "On-chain rejection",
          "entity": "TOKEN",
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
