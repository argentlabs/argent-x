import { setupServer } from "msw/node"
import { IActivityStorage } from "../../../../shared/activity/types"
import { ActivityService } from "./implementation"
import { Activity } from "./model"
import { rest } from "msw"
import { KeyValueStorage } from "../../../../shared/storage"

describe("findLatestBalanceChangingTransaction", () => {
  const makeService = () => {
    const activityStore = {
      set: vi.fn(),
    } as unknown as KeyValueStorage<IActivityStorage>

    const activityService = new ActivityService(
      "apiBase",
      activityStore,
      undefined,
    )
    return {
      activityService,
      activityStore,
    }
  }
  it("returns null for empty array", () => {
    const { activityService } = makeService()
    expect(activityService.findLatestBalanceChangingTransaction([])).toBeNull()
  })

  it("returns null when all activities have empty transfers", () => {
    const { activityService } = makeService()

    const activities = [
      { transaction: { blockNumber: 1, transactionIndex: 1 }, transfers: [] },
      { transaction: { blockNumber: 2, transactionIndex: 2 }, transfers: [] },
    ]
    expect(
      activityService.findLatestBalanceChangingTransaction(
        activities as unknown as Activity[],
      ),
    ).toBeNull()
  })

  it("returns the latest activity with non-empty transfers", () => {
    const { activityService } = makeService()

    const activities = [
      {
        transaction: { blockNumber: 1, transactionIndex: 1 },
        transfers: ["transfer1"],
      },
      {
        transaction: { blockNumber: 2, transactionIndex: 2 },
        transfers: ["transfer2"],
      },
    ] as unknown as Activity[]
    expect(
      activityService.findLatestBalanceChangingTransaction(activities),
    ).toEqual(activities[1])
  })

  it("handles a single activity with non-empty transfers", () => {
    const { activityService } = makeService()

    const activity = {
      transaction: { blockNumber: 1, transactionIndex: 1 },
      transfers: ["transfer"],
    }
    expect(
      activityService.findLatestBalanceChangingTransaction([
        activity,
      ] as unknown as Activity[]),
    ).toEqual(activity)
  })

  it("returns the activity with highest transactionIndex for same blockNumber", () => {
    const { activityService } = makeService()

    const activities = [
      {
        transaction: { blockNumber: 1, transactionIndex: 2 },
        transfers: ["transfer2"],
      },
      {
        transaction: { blockNumber: 1, transactionIndex: 1 },
        transfers: ["transfer1"],
      },
    ]
    expect(
      activityService.findLatestBalanceChangingTransaction(
        activities as unknown as Activity[],
      ),
    ).toEqual(activities[0])
  })

  it("prioritizes pending transactions over ongoing ones", () => {
    const { activityService } = makeService()

    const activities = [
      {
        transaction: { transactionIndex: 2, status: "pending" },
        transfers: ["transfer2"],
      },
      {
        transaction: { blockNumber: 1, transactionIndex: 2 },
        transfers: ["transfer2"],
      },
      {
        transaction: { blockNumber: 1, transactionIndex: 1 },
        transfers: ["transfer1"],
      },
    ]
    expect(
      activityService.findLatestBalanceChangingTransaction(
        activities as unknown as Activity[],
      ),
    ).toEqual(activities[0])
  })
})

const ADDRESS_WITHOUT_NEW_ACTIVITY = "0x1"
const ADDRESS_WITH_NEW_ACTIVITY = "0x2"
const ADDRESS_WITH_INVALID_DATA = "0x3"
const OLD_TRANSACTION_HASH = "0x12345"
const NEW_TRANSACTION_HASH = "0x123456"
const OLD_ID = "4b3286e5-b122-45e5-8097-30b44926f553"
/**
 * @vitest-environment jsdom
 */
const OLD_ACTIVITIES = [
  {
    compositeId: "id",
    id: OLD_ID,
    status: "success",
    wallet:
      "0x06179cD342F04f69726D4D8B974c449dAC7002a58437Aef0E6eD23db40D31862",
    txSender:
      "0x06179cD342F04f69726D4D8B974c449dAC7002a58437Aef0E6eD23db40D31862",
    source: "source",
    type: "payment",
    group: "finance",
    submitted: 1234,
    lastModified: 1234,
    transaction: {
      network: "goerli",
      hash: OLD_TRANSACTION_HASH,
      status: "success",
      blockNumber: 1,
      transactionIndex: 2,
    },
    transfers: [
      {
        type: "payment",
        leg: "credit",
        asset: {
          type: "token",
          tokenAddress:
            "0x06179cD342F04f69726D4D8B974c449dAC7002a58437Aef0E6eD23db40D31862",
          amount: "100",
          fiatAmount: {
            currency: "USD",
            currencyAmount: 100,
          },
        },
      },
    ],
    fees: [],
    relatedAddresses: [],
    network: "goerli",
  },
]
const NEW_ACTIVITIES = [
  {
    compositeId: "id",
    id: "4b3286e5-b122-45e5-8097-30b44926f555",
    status: "success",
    wallet:
      "0x06179cD342F04f69726D4D8B974c449dAC7002a58437Aef0E6eD23db40D31862",
    txSender:
      "0x06179cD342F04f69726D4D8B974c449dAC7002a58437Aef0E6eD23db40D31862",
    source: "source",
    type: "payment",
    group: "finance",
    submitted: 1234,
    lastModified: 1235,
    transaction: {
      network: "goerli",
      hash: NEW_TRANSACTION_HASH,
      status: "success",
      blockNumber: 1,
      transactionIndex: 3,
    },
    transfers: [
      {
        type: "payment",
        leg: "credit",
        asset: {
          type: "token",
          tokenAddress:
            "0x06179cD342F04f69726D4D8B974c449dAC7002a58437Aef0E6eD23db40D31862",
          amount: "100",
          fiatAmount: {
            currency: "USD",
            currencyAmount: 100,
          },
        },
      },
    ],
    fees: [],
    relatedAddresses: [],
    network: "goerli",
  },
]
const server = setupServer(
  rest.get("/apiBase/goerli/account/:address/activities", (req, res, ctx) => {
    if (req.params.address === ADDRESS_WITHOUT_NEW_ACTIVITY) {
      return res(
        ctx.json({
          activities: OLD_ACTIVITIES,
        }),
      )
    }
    if (req.params.address === ADDRESS_WITH_NEW_ACTIVITY) {
      return res(
        ctx.json({
          activities: NEW_ACTIVITIES,
        }),
      )
    }
    if (req.params.address === ADDRESS_WITH_INVALID_DATA) {
      return res(
        ctx.json({
          activities: [{ invalid: "data" }],
        }),
      )
    }
  }),
)

describe("shouldUpdateBalance", () => {
  beforeAll(() => {
    server.listen()
  })
  afterAll(() => server.close())
  const makeService = () => {
    const activityStore = {
      set: vi.fn(),
      get: vi.fn().mockResolvedValue({
        [ADDRESS_WITHOUT_NEW_ACTIVITY]: {
          id: OLD_ID,
          lastModified: 1234,
        },
      }),
    } as unknown as KeyValueStorage<IActivityStorage>

    const activityService = new ActivityService(
      "/apiBase",
      activityStore,
      undefined,
    )
    return {
      activityService,
      activityStore,
    }
  }
  it("returns false when there's no new activity", async () => {
    const { activityService, activityStore } = makeService()
    const spyGet = vi.spyOn(activityStore, "get")

    const res = await activityService.shouldUpdateBalance({
      address: ADDRESS_WITHOUT_NEW_ACTIVITY,
      networkId: "goerli-alpha",
    })
    expect(spyGet).toHaveBeenCalled()
    expect(res).toEqual({ shouldUpdate: false })
  })
  it("returns true when there's new activity and updates the storage", async () => {
    const { activityService, activityStore } = makeService()
    const spyGet = vi.spyOn(activityStore, "get")

    const res = await activityService.shouldUpdateBalance({
      address: ADDRESS_WITH_NEW_ACTIVITY,
      networkId: "goerli-alpha",
    })
    expect(spyGet).toHaveBeenCalled()
    expect(res).toEqual({
      id: "4b3286e5-b122-45e5-8097-30b44926f555",
      lastModified: 1235,
      shouldUpdate: true,
    })
  })

  describe("fetchActivities", () => {
    beforeAll(() => {
      server.listen()
    })
    afterAll(() => server.close())
    test.each([
      [ADDRESS_WITHOUT_NEW_ACTIVITY, OLD_ACTIVITIES],
      [ADDRESS_WITH_NEW_ACTIVITY, NEW_ACTIVITIES],
    ])(
      "return the correctly parsed activities when fetching from the API",
      async (address, payload) => {
        const { activityService } = makeService()
        const response = await activityService.fetchActivities({
          address,
          networkId: "goerli-alpha",
          lastModified: 1234,
        })

        expect(response).toEqual(payload)
      },
    )
    // TODO uncomment when we have final version of the API
    // it("should throw when given an invalid output from the API", async () => {
    //   const { activityService } = makeService()
    //   try {
    //     await activityService.fetchActivities({
    //       address: ADDRESS_WITH_INVALID_DATA,
    //       networkId: "goerli-alpha",
    //       lastModified: 1234,
    //     })
    //   } catch (e) {
    //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //     //@ts-expect-error
    //     expect(e.message).toEqual("Failed to parse backend response")
    //   }
    // })
  })
})
