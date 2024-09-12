import { describe, expect, test } from "vitest"

import { IExplorerTransaction } from "../../../../explorer/type"
import { fingerprintExplorerTransaction } from "./fingerprintExplorerTransaction"
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
} from "./__fixtures__/explorer-transactions/sepolia-alpha"

describe("fingerprintExplorerTransaction", () => {
  describe("when valid", () => {
    test("should return the expected fingerprint", () => {
      expect(
        fingerprintExplorerTransaction(accountCreated as IExplorerTransaction),
      ).toMatchInlineSnapshot('"events[Upgraded]"')
      expect(
        fingerprintExplorerTransaction(
          accountCreatedAlt as IExplorerTransaction,
        ),
      ).toMatchInlineSnapshot('"events[]"')
      expect(
        fingerprintExplorerTransaction(accountUpgrade as IExplorerTransaction),
      ).toMatchInlineSnapshot('"events[Upgraded] calls[upgrade]"')
      expect(
        fingerprintExplorerTransaction(
          dappAspectBuyNft as IExplorerTransaction,
        ),
      ).toMatchInlineSnapshot(
        '"events[Approval,Approval,Transfer,Transfer,Transfer] calls[approve]"',
      )
      expect(
        fingerprintExplorerTransaction(dappBriq as IExplorerTransaction),
      ).toMatchInlineSnapshot(
        '"events[TransferSingle,Transfer,URI] calls[assemble]"',
      )
      expect(
        fingerprintExplorerTransaction(
          dappMintSquareBuyNft as IExplorerTransaction,
        ),
      ).toMatchInlineSnapshot(
        '"events[Transfer,Transfer,Approval,Transfer,TakerBid] calls[matchAskWithTakerBid]"',
      )
      expect(
        fingerprintExplorerTransaction(
          dappInfluenceCrewmatePurchaseNft as IExplorerTransaction,
        ),
      ).toMatchInlineSnapshot(
        '"events[Approval,Transfer,Transfer] calls[approve]"',
      )
      expect(
        fingerprintExplorerTransaction(dappNoGame as IExplorerTransaction),
      ).toMatchInlineSnapshot(
        '"events[structure_updated] calls[crystal_upgrade_complete]"',
      )
      expect(
        fingerprintExplorerTransaction(
          erc20ApproveUnlimited as IExplorerTransaction,
        ),
      ).toMatchInlineSnapshot('"events[Approval] calls[approve]"')
      expect(
        fingerprintExplorerTransaction(
          erc20MintTestToken as IExplorerTransaction,
        ),
      ).toMatchInlineSnapshot('"events[] calls[mint]"')
      expect(
        fingerprintExplorerTransaction(
          erc20SwapAlphaRoad as IExplorerTransaction,
        ),
      ).toMatchInlineSnapshot(
        '"events[Approval,Transfer,Transfer,Swap] calls[approve,swapExactTokensForTokens]"',
      )
      expect(
        fingerprintExplorerTransaction(
          erc20SwapJediswap as IExplorerTransaction,
        ),
      ).toMatchInlineSnapshot(
        '"events[Approval,Transfer,Sync,Swap] calls[approve,swap_exact_tokens_for_tokens]"',
      )
      expect(
        fingerprintExplorerTransaction(erc20SwapMySwap as IExplorerTransaction),
      ).toMatchInlineSnapshot(
        '"events[Approval,Transfer,Transfer] calls[approve]"',
      )
      expect(
        fingerprintExplorerTransaction(erc20Transfer as IExplorerTransaction),
      ).toMatchInlineSnapshot('"events[Transfer] calls[transfer]"')
      expect(
        fingerprintExplorerTransaction(
          erc20TransferWithSequencerEvent as IExplorerTransaction,
        ),
      ).toMatchInlineSnapshot('"events[Transfer] calls[transfer]"')
      expect(
        fingerprintExplorerTransaction(
          erc721MintAspect as IExplorerTransaction,
        ),
      ).toMatchInlineSnapshot('"events[Transfer] calls[mint]"')
      expect(
        fingerprintExplorerTransaction(
          erc721MintMintSquare as IExplorerTransaction,
        ),
      ).toMatchInlineSnapshot('"events[Transfer] calls[mint]"')
      expect(
        fingerprintExplorerTransaction(erc721Transfer as IExplorerTransaction),
      ).toMatchInlineSnapshot('"events[Approval,Transfer] calls[transferFrom]"')
    })
  })
  describe("when invalid", () => {
    test("should return undefined", () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(fingerprintExplorerTransaction({})).toBeUndefined()
    })
  })
})
