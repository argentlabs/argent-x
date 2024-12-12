/* eslint-disable @typescript-eslint/ban-ts-comment */
import { describe, expect, it } from "vitest"
import { getTransactionIcon } from "./getTransactionIcon"
import { ApproveScreenType } from "./types"
import sendFixture from "../../../../shared/transactionReview/__fixtures__/send.json"
import swapFixture from "../../../../shared/transactionReview/__fixtures__/swap.json"
import sendNftFixture from "../../../../shared/transactionReview/__fixtures__/send-nft.json"

describe("getTransactionIcon", () => {
  it("should return correct icon for DECLARE screen type", () => {
    expect(getTransactionIcon(ApproveScreenType.DECLARE)).toBe("DocumentIcon")
  })

  it("should return correct icon for DEPLOY screen type", () => {
    expect(getTransactionIcon(ApproveScreenType.DEPLOY)).toBe("DocumentIcon")
  })

  it("should return correct icon for ACCOUNT_DEPLOY screen type", () => {
    expect(getTransactionIcon(ApproveScreenType.ACCOUNT_DEPLOY)).toBe(
      "RocketSecondaryIcon",
    )
  })

  it("should return correct icon for MULTISIG_DEPLOY screen type", () => {
    expect(getTransactionIcon(ApproveScreenType.MULTISIG_DEPLOY)).toBe(
      "MultisigSecondaryIcon",
    )
  })

  it("should return correct icon for MULTISIG_ADD_SIGNERS screen type", () => {
    expect(getTransactionIcon(ApproveScreenType.MULTISIG_ADD_SIGNERS)).toBe(
      "AddContactSecondaryIcon",
    )
  })

  it("should return correct icon for MULTISIG_REMOVE_SIGNERS screen type", () => {
    expect(getTransactionIcon(ApproveScreenType.MULTISIG_REMOVE_SIGNERS)).toBe(
      "RemoveContactSecondaryIcon",
    )
  })

  it("should return correct icon for MULTISIG_REPLACE_SIGNER screen type", () => {
    expect(getTransactionIcon(ApproveScreenType.MULTISIG_REPLACE_SIGNER)).toBe(
      "MultisigReplaceIcon",
    )
  })

  it("should return correct icon for MULTISIG_UPDATE_THRESHOLD screen type", () => {
    expect(
      getTransactionIcon(ApproveScreenType.MULTISIG_UPDATE_THRESHOLD),
    ).toBe("ApproveIcon")
  })

  it("should return correct icon for ADD_GUARDIAN screen type", () => {
    expect(getTransactionIcon(ApproveScreenType.ADD_GUARDIAN)).toBe(
      "ShieldSecondaryIcon",
    )
  })

  it("should return correct icon for REMOVE_GUARDIAN screen type", () => {
    expect(getTransactionIcon(ApproveScreenType.REMOVE_GUARDIAN)).toBe(
      "NoShieldSecondaryIcon",
    )
  })

  it("should return correct icon for MULTISIG_ON_CHAIN_REJECT screen type", () => {
    expect(getTransactionIcon(ApproveScreenType.MULTISIG_ON_CHAIN_REJECT)).toBe(
      "CrossSecondaryIcon",
    )
  })

  it("should return correct icon for a swap transaction", () => {
    // @ts-ignore
    expect(getTransactionIcon(undefined, swapFixture)).toBe("SwapPrimaryIcon")
  })

  it("should return correct icon for a transfer transaction", () => {
    // @ts-ignore
    expect(getTransactionIcon(undefined, sendFixture)).toBe("SendSecondaryIcon")
  })

  it("should return correct icon for an NFT transfer transaction", () => {
    // @ts-ignore
    expect(getTransactionIcon(undefined, sendNftFixture)).toBe("NftIcon")
  })

  it("should return default icon for unknown transaction type", () => {
    expect(getTransactionIcon(ApproveScreenType.TRANSACTION)).toBe(
      "NetworkSecondaryIcon",
    )
  })
})
