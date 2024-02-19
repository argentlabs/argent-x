import { Warning } from "../../../../shared/transactionReview/schema"
import { getHighestSeverity, getTitleForWarnings } from "./helper"

describe("getHighestSeverity", () => {
  it("should return null for an empty array", () => {
    expect(getHighestSeverity([])).toBeNull()
  })

  it("should return the warning with the highest severity", () => {
    const warnings = [
      { severity: "info" },
      { severity: "high" },
      { severity: "critical" },
      { severity: "caution" },
    ] as unknown as Warning[]
    expect(getHighestSeverity(warnings)).toEqual({ severity: "critical" })
  })

  it("should return the first warning if all have the same severity", () => {
    const warnings = [
      { severity: "high" },
      { severity: "high" },
      { severity: "high" },
    ] as unknown as Warning[]
    expect(getHighestSeverity(warnings)).toEqual({ severity: "high" })
  })

  it("should handle a single warning", () => {
    const warnings = [{ severity: "caution" }] as unknown as Warning[]
    expect(getHighestSeverity(warnings)).toEqual({ severity: "caution" })
  })

  it("should return the first occurrence of the highest severity", () => {
    const warnings = [
      { severity: "high" },
      { severity: "critical" },
      { severity: "critical" },
    ] as unknown as Warning[]
    expect(getHighestSeverity(warnings)).toEqual({ severity: "critical" })
  })
})

describe("getTitleForWarnings", () => {
  it("should return the title for a single warning", () => {
    const warnings = [{ reason: "undeployed_account" }] as unknown as Warning[]
    expect(getTitleForWarnings(warnings)).toEqual(
      "Sending to the correct account?",
    )
  })
  it("should return the title for multiple warnings", () => {
    const warnings = [
      { reason: "undeployed_account" },
      { reason: "contract_is_not_verified" },
    ] as unknown as Warning[]
    expect(getTitleForWarnings(warnings)).toEqual("2 risks identified")
  })
})
