import { Activity } from "../schema"
import { isProvisionWithDeploymentActivity } from "./isProvisionWithDeploymentActivity"

describe("isProvisionWithDeploymentActivity", () => {
  const createBaseActivity = () =>
    ({
      type: "multicall",
      details: {
        calls: [],
      },
      wallet: "0x1",
    } as unknown as Activity)

  it("returns false when there are no calls in details", () => {
    const activity = createBaseActivity()
    expect(isProvisionWithDeploymentActivity(activity)).toBe(false)
  })

  it("returns false when calls are present but none match", () => {
    const activity = createBaseActivity()
    activity?.details?.calls?.push({
      details: {
        type: "non-deploy-type",
        contractAddress: "0x0",
      },
    })

    expect(isProvisionWithDeploymentActivity(activity)).toBe(false)
  })

  it("returns false when matching call has a different wallet address", () => {
    const activity = createBaseActivity()
    activity?.details?.calls?.push({
      details: {
        type: "deploy",
        contractAddress: "0x2",
      },
    })

    expect(isProvisionWithDeploymentActivity(activity)).toBe(false)
  })

  it("returns true when matching call has the same wallet address", () => {
    const activity = createBaseActivity()
    activity?.details?.calls?.push({
      details: {
        type: "deploy",
        contractAddress: "0x1",
      },
    })

    expect(isProvisionWithDeploymentActivity(activity)).toBe(true)
  })

  it("returns false when activity type is not multicall", () => {
    const activity = createBaseActivity()
    activity.type = "approval"

    expect(isProvisionWithDeploymentActivity(activity)).toBe(false)
  })
})
