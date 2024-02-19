import { Activity } from "../schema"
import { hasDelegationActivity } from "./hasDelegationActivity"

describe("hasDelegationActivity", () => {
  const createBaseActivity = (calls: Activity["details"]["calls"]) =>
    ({
      details: { calls },
    } as unknown as Activity)

  it("returns false when activity has no details", () => {
    const activity = {} as unknown as Activity
    expect(hasDelegationActivity(activity)).toBe(false)
  })

  it("returns false when details are present but no calls", () => {
    const activity = createBaseActivity([])
    expect(hasDelegationActivity(activity)).toBe(false)
  })

  it("returns false when calls do not match the function name", () => {
    const activity = createBaseActivity([
      { details: { function: { name: "otherFunction" } } },
    ])
    expect(hasDelegationActivity(activity)).toBe(false)
  })

  it("returns true when a call matches the function name", () => {
    const activity = createBaseActivity([
      { details: { function: { name: "lock_and_delegate_by_sig" } } },
    ])
    expect(hasDelegationActivity(activity)).toBe(true)
  })

  it("returns false when calls have null or undefined details", () => {
    const activity = createBaseActivity([{}, { details: undefined }])
    expect(hasDelegationActivity(activity)).toBe(false)
  })

  it("returns true when mixed calls contain at least one matching function name", () => {
    const activity = createBaseActivity([
      { details: { function: { name: "otherFunction" } } },
      { details: { function: { name: "lock_and_delegate_by_sig" } } },
    ])
    expect(hasDelegationActivity(activity)).toBe(true)
  })
})
