import { Activity } from "../schema"
import { parseProvisionActivity } from "./parseProvisionActivity"

describe("parseProvisionActivity", () => {
  const createBaseActivity = (
    type: Activity["type"],
    status: Activity["status"],
    hasProvision = false,
  ) =>
    ({
      type,
      status,
      details: {
        calls: hasProvision
          ? [{ details: { context: { isProvisionAirdrop: true } } }]
          : [],
        context: hasProvision ? { isProvisionAirdrop: true } : undefined,
      },
    } as unknown as Activity)

  it("returns undefined when no activities are provided", () => {
    expect(parseProvisionActivity([])).toBeUndefined()
  })

  it("returns undefined when no activities are successful", () => {
    const activities = [createBaseActivity("multicall", "pending")]
    expect(parseProvisionActivity(activities)).toBeUndefined()
  })

  it("returns a successful multicall activity with provision", () => {
    const provisionActivity = createBaseActivity("multicall", "success", true)
    const activities = [provisionActivity]
    expect(parseProvisionActivity(activities)).toEqual(provisionActivity)
  })

  it("returns a successful non-multicall activity with provision", () => {
    const provisionActivity = createBaseActivity("approval", "success", true)
    const activities = [provisionActivity]
    expect(parseProvisionActivity(activities)).toEqual(provisionActivity)
  })

  it("returns undefined when successful activities do not have provision", () => {
    const activities = [
      createBaseActivity("multicall", "success"),
      createBaseActivity("approval", "success"),
    ]
    expect(parseProvisionActivity(activities)).toBeUndefined()
  })

  it("returns the last multicall activity with provision when multiple are present", () => {
    const firstProvisionActivity = createBaseActivity(
      "multicall",
      "success",
      true,
    )
    const secondProvisionActivity = createBaseActivity(
      "multicall",
      "success",
      true,
    )
    const activities = [firstProvisionActivity, secondProvisionActivity]
    expect(parseProvisionActivity(activities)).toEqual(secondProvisionActivity)
  })
})
