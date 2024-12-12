/* eslint-disable @typescript-eslint/ban-ts-comment */
import { describe, expect, it } from "vitest"
import { getTransactionTitle } from "./getTransactionTitle"
import { ApproveScreenType } from "./types"
import sendFixture from "../../../../shared/transactionReview/__fixtures__/send.json"
import swapFixture from "../../../../shared/transactionReview/__fixtures__/swap.json"
import sendNftFixture from "../../../../shared/transactionReview/__fixtures__/send-nft.json"

describe("getTransactionTitle", () => {
  it("should return correct title for DECLARE screen type", () => {
    expect(getTransactionTitle(ApproveScreenType.DECLARE)).toBe(
      "Declare contract",
    )
  })

  it("should return correct title for DEPLOY screen type", () => {
    expect(getTransactionTitle(ApproveScreenType.DEPLOY)).toBe(
      "Deploy contract",
    )
  })

  it("should return correct title for ACCOUNT_DEPLOY screen type", () => {
    expect(getTransactionTitle(ApproveScreenType.ACCOUNT_DEPLOY)).toBe(
      "Activate account",
    )
  })

  it("should return correct title for MULTISIG_DEPLOY screen type", () => {
    expect(getTransactionTitle(ApproveScreenType.MULTISIG_DEPLOY)).toBe(
      "Activate multisig",
    )
  })

  it("should return correct title for MULTISIG_ADD_SIGNERS screen type", () => {
    expect(getTransactionTitle(ApproveScreenType.MULTISIG_ADD_SIGNERS)).toBe(
      "Add multisig owner",
    )
  })

  it("should return correct title for MULTISIG_REMOVE_SIGNERS screen type", () => {
    expect(getTransactionTitle(ApproveScreenType.MULTISIG_REMOVE_SIGNERS)).toBe(
      "Remove owner and set confirmations",
    )
  })

  it("should return correct title for MULTISIG_REPLACE_SIGNER screen type", () => {
    expect(getTransactionTitle(ApproveScreenType.MULTISIG_REPLACE_SIGNER)).toBe(
      "Replace multisig owner",
    )
  })

  it("should return correct title for MULTISIG_UPDATE_THRESHOLD screen type", () => {
    expect(
      getTransactionTitle(ApproveScreenType.MULTISIG_UPDATE_THRESHOLD),
    ).toBe("Set confirmations")
  })

  it("should return correct title for ADD_GUARDIAN screen type", () => {
    expect(getTransactionTitle(ApproveScreenType.ADD_GUARDIAN)).toBe(
      "Add Guardian",
    )
  })

  it("should return correct title for REMOVE_GUARDIAN screen type", () => {
    expect(getTransactionTitle(ApproveScreenType.REMOVE_GUARDIAN)).toBe(
      "Remove Guardian",
    )
  })

  it("should return correct title for a swap transaction", () => {
    expect(
      // @ts-ignore
      getTransactionTitle(ApproveScreenType.TRANSACTION, swapFixture),
    ).toBe("Swap ETH to DAI")
  })

  it("should return correct title for a transfer transaction", () => {
    expect(
      // @ts-ignore
      getTransactionTitle(ApproveScreenType.TRANSACTION, sendFixture),
    ).toBe("Send 0.0011 ETH")
  })

  it("should return correct title for an NFT transfer transaction", () => {
    expect(
      // @ts-ignore
      getTransactionTitle(ApproveScreenType.TRANSACTION, sendNftFixture),
    ).toBe("Transfer 1 nft")
  })

  it("should return default title for unknown transaction type", () => {
    expect(getTransactionTitle(ApproveScreenType.TRANSACTION)).toBe(
      "Confirm transaction",
    )
  })

  it("should use provided fallback for unknown transaction type", () => {
    expect(
      getTransactionTitle(
        ApproveScreenType.TRANSACTION,
        undefined,
        "custom fallback",
      ),
    ).toBe("Confirm custom fallback")
  })
})
