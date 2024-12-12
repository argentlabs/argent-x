import type { Warning } from "@argent/x-shared/simulation"
import type { ITransactionReviewWarning } from "@argent/x-shared"
import { renderHook, waitFor } from "@testing-library/react"
import * as reactViews from "../../../views/implementation/react"
import { useWarningsTitle } from "./helper"

describe("useWarningsTitle", () => {
  const warningsInStore = [
    {
      reason: "undeployed_account",
      title: "Sending to the correct account?",
      severity: "caution",
      description:
        "The account you are sending to hasn't done any transactions, please double check the address",
    },
    {
      reason: "token_a_black_listed",
      title: "Use of an unsafe token",
      severity: "caution",
      description: "You are using an unsafe token. Be aware of the risks.",
    },
    {
      reason: "approval_too_high",
      title: "Approval of spending limit is too high",
      severity: "caution",
      description:
        "You're approving one or more addresses to spend more tokens than you're using in this transaction. These funds will not be spent but you should not proceed if you don’t trust this app.",
    },
  ] as ITransactionReviewWarning[]
  vi.mock("../../../views/implementation/react", () => ({
    useView: vi.fn(),
  }))
  vi.mocked(reactViews.useView).mockReturnValue(warningsInStore)

  it("should return the title for a single warning", async () => {
    const warnings = [{ reason: "undeployed_account" }] as unknown as Warning[]
    const { result } = renderHook(() => useWarningsTitle(warnings))

    await waitFor(() => {
      expect(result.current).toEqual("Sending to the correct account?")
    })
  })

  it("should return the title for multiple warnings", () => {
    const warnings = [
      { reason: "undeployed_account" },
      { reason: "approval_too_high" },
    ] as unknown as Warning[]
    expect(useWarningsTitle(warnings)).toEqual("2 risks identified")
  })

  it("should return the title for 0 warnings", () => {
    expect(useWarningsTitle([])).toEqual("0 risks identified")
  })
})
