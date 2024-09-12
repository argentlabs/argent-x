import objectHash from "object-hash"
import { describe, it } from "vitest"

import { InMemoryRepository } from "../../storage/__new/__test__/inmemoryImplementations"
import { delay } from "../../utils/delay"
import { compareExtensionActionItems } from "../store"
import type { ActionItem, ExtensionActionItem } from "../types"
import { DEFAULT_APPROVAL_TIMEOUT_MS, getActionQueue } from "./getActionQueue"

const txFixture: ActionItem = {
  type: "TRANSACTION",
  payload: {
    transactions: {
      contractAddress: "0x123",
      entrypoint: "fooBar",
      calldata: [],
    },
    createdAt: 123,
  },
}

const txFixture2: ActionItem = {
  type: "TRANSACTION",
  payload: {
    transactions: {
      contractAddress: "0x456",
      entrypoint: "fooBar",
      calldata: [],
    },
    createdAt: 456,
  },
}

const txFixtureHash = objectHash(txFixture)
const txFixtureHash2 = objectHash(txFixture2)

describe("actionQueue", () => {
  const actionQueueRepo = new InMemoryRepository<ExtensionActionItem>({
    namespace: "core:actionQueue",
    compare: compareExtensionActionItems,
  })

  const actionQueue = getActionQueue<ActionItem>(actionQueueRepo)

  afterEach(async () => {
    await actionQueue.removeAll()
  })

  it("is initially empty", async () => {
    expect(await actionQueue.getAll()).toEqual([])
  })

  it("automatically adds hash and expiry on add", async () => {
    await actionQueue.add(txFixture)
    const [item] = await actionQueue.getAll()
    expect(item.meta).toHaveProperty("expires")
    expect(item.meta.hash).toEqual(txFixtureHash)
  })

  it("automatically adds an item to the front of the queue", async () => {
    await actionQueue.add(txFixture)
    await actionQueue.addFront(txFixture2)
    const [item] = await actionQueue.getAll()
    expect(item.meta.hash).toEqual(txFixtureHash2)
  })

  it("automatically adds an item to the front even the queue is empty", async () => {
    await actionQueue.addFront(txFixture)
    const [item] = await actionQueue.getAll()
    expect(item.meta.hash).toEqual(txFixtureHash)
  })

  it("automatically removes expired items on getAll", async () => {
    await actionQueue.add(txFixture, { expires: 100 })
    const [item] = await actionQueue.getAll()
    expect(item.meta.hash).toEqual(txFixtureHash)
    await delay(100)
    expect(await actionQueue.getAll()).toEqual([])
  })

  it("removes item by hash", async () => {
    await actionQueue.add(txFixture)
    const [item] = await actionQueue.getAll()
    expect(item.meta.hash).toEqual(txFixtureHash)
    await actionQueue.remove(txFixtureHash)
    expect(await actionQueue.getAll()).toEqual([])
  })

  it("only adds single item if it has the same hash", async () => {
    await actionQueue.add(txFixture)
    await actionQueue.add(txFixture)
    await actionQueue.add(txFixture)
    const items = await actionQueue.getAll()
    expect(items.length).toEqual(1)

    await actionQueue.addFront(txFixture)
    const itemsFront = await actionQueue.getAll()
    expect(itemsFront.length).toEqual(1)
  })

  it("updates meta", async () => {
    await actionQueue.add(txFixture)
    const startedApproving = Date.now()
    await actionQueue.updateMeta(txFixtureHash, { startedApproving })
    const [item] = await actionQueue.getAll()
    expect(item.meta.startedApproving).toEqual(startedApproving)
  })

  it("automatically resets approval state on getAll", async () => {
    await actionQueue.add(txFixture)
    const startedApproving = Date.now() - DEFAULT_APPROVAL_TIMEOUT_MS - 100
    await actionQueue.updateMeta(txFixtureHash, { startedApproving })
    const [item] = await actionQueue.getAll()
    expect(item.meta.startedApproving).toEqual(startedApproving)
    await delay(100)
    const [itemReset] = await actionQueue.getAll()
    expect(itemReset.meta.startedApproving).toBeUndefined()
  })
})
