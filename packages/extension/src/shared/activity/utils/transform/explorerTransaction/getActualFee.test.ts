import { getActualFee } from "./getActualFee"
import { describe, it, expect } from "vitest"
import { IExplorerTransaction } from "../../../../explorer/type"

describe("getActualFee", () => {
  it("should return correct fee, given actualFee as a string", () => {
    const mockTransaction: IExplorerTransaction = {
      id: "0x1",
      blockNumber: 1,
      timestamp: 1,
      transactionHash: "0x1",
      actualFee: "0x5",
      finalityStatus: "ACCEPTED_ON_L2",
      statusData: "",
      events: [],
    }
    const result = getActualFee(mockTransaction)
    expect(result).toBe("0x5")
  })

  it("should return correct fee, given actualFee as a 2 dimensional schema", () => {
    const mockTransaction: IExplorerTransaction = {
      id: "0x1",
      blockNumber: 1,
      timestamp: 1,
      transactionHash: "0x1",
      actualFee: {
        amount: "0x6",
        unit: "WEI",
      },
      finalityStatus: "ACCEPTED_ON_L2",
      statusData: "",
      events: [],
    }
    const result = getActualFee(mockTransaction)
    expect(result).toBe("0x6")
  })
})
