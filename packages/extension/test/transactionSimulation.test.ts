import { describe, expect, test } from "vitest"

import { findTransfersAndApprovals } from "../src/shared/transactionSimulation/findTransferAndApproval"
import type {
  ApprovalEvent,
  TransferEvent,
} from "../src/shared/transactionSimulation/types"
import MockERC20TransferSimulation from "./erc20TransferSimulation.mock.json"
import MockJediswapSimulation from "./jediswapSimulation.mock.json"

describe("Transaction simulation", () => {
  describe("Transaction simulation fallback", () => {
    test("should find transfers and approvals for erc20 transfer", () => {
      const internalCalls = MockERC20TransferSimulation.trace
        .function_invocation.internal_calls as any
      const transfers: Array<TransferEvent> = []
      const approvals: Array<ApprovalEvent> = []
      const newTransfers = findTransfersAndApprovals(
        internalCalls,
        approvals,
        transfers,
      )
      expect(newTransfers.transfers).toEqual([
        {
          tokenAddress:
            "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          from: "0x18c5e573b5ebe06f9981aba0c302f91789f82b13ac07e9835659b1e5c5ebe10",
          to: "0x18c5e573b5ebe06f9981aba0c302f91789f82b13ac07e9835659b1e5c5ebe10",
          value: "2669394992153000809",
        },
      ])
    })
    test("should find transfers and approvals for Jediswap swap", () => {
      const internalCalls = MockJediswapSimulation.trace.function_invocation
        .internal_calls as any

      const transfers: Array<TransferEvent> = []
      const approvals: Array<ApprovalEvent> = []

      const newTransfers = findTransfersAndApprovals(
        internalCalls,
        approvals,
        transfers,
      )

      expect(approvals).toEqual([
        {
          tokenAddress:
            "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          owner:
            "0x146e78728144a8230383b422bc43c969eebac0bf8d2ddb799a294f9968bcc3d",
          spender:
            "0x41fd22b238fa21cfcf5dd45a8548974d8263b3a531a60388411c5e230f97023",
          value: "12566181303571314",
        },
      ])

      expect(approvals).toEqual(newTransfers.approvals)

      expect(transfers).toEqual([
        {
          tokenAddress:
            "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          from: "0x146e78728144a8230383b422bc43c969eebac0bf8d2ddb799a294f9968bcc3d",
          to: "0x45e7131d776dddc137e30bdd490b431c7144677e97bf9369f629ed8d3fb7dd6",
          value: "12566181303571314",
        },
        {
          tokenAddress:
            "0x68f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8",
          from: "0x45e7131d776dddc137e30bdd490b431c7144677e97bf9369f629ed8d3fb7dd6",
          to: "0x5801bdad32f343035fb242e98d1e9371ae85bc1543962fedea16c59b35bd19b",
          value: "20884965",
        },
        {
          tokenAddress:
            "0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
          from: "0x5801bdad32f343035fb242e98d1e9371ae85bc1543962fedea16c59b35bd19b",
          to: "0x146e78728144a8230383b422bc43c969eebac0bf8d2ddb799a294f9968bcc3d",
          value: "20551222",
        },
      ])

      expect(transfers).toEqual(newTransfers.transfers)
    })
  })
})
