import type { BaseTransaction } from "../../../shared/transactions/interface"
import { BaseTransactionTrackingService } from "./BaseTransactionTrackingService"

class TestTransactionService extends BaseTransactionTrackingService<
  BaseTransaction,
  string
> {}

describe("BaseTransactionTrackingService", () => {
  let service: TestTransactionService
  const transaction1: BaseTransaction = { hash: "0x1", networkId: "net1" }
  const transaction2: BaseTransaction = { hash: "0x2", networkId: "net2" }

  beforeEach(() => {
    const toIdentifier = (tx: BaseTransaction) => `${tx.networkId}-${tx.hash}`
    service = new TestTransactionService("default", toIdentifier)
  })

  test("add transaction", async () => {
    await service.add(transaction1)
    const status = await service.get(transaction1)
    expect(status).toBe("default")
  })

  test("get transaction", async () => {
    await service.add(transaction1)
    const status = await service.get(transaction1)
    expect(status).toBe("default")

    await expect(service.get(transaction2)).rejects.toThrow(
      "Transaction [object Object] not tracked",
    )
  })

  test("subscribe to transaction updates", async () => {
    const callback = vi.fn()
    const unsubscribe = await service.subscribe(callback)

    await service.add(transaction1)
    expect(callback).toBeCalledWith({
      transaction: transaction1,
      status: "default",
    })

    unsubscribe()

    await service.add(transaction2)
    expect(callback).not.toBeCalledWith({
      transaction: transaction2,
      status: "default",
    })
  })

  test("callbacks are notified on transaction add", async () => {
    const callback1 = vi.fn()
    const callback2 = vi.fn()

    await service.subscribe(callback1)
    await service.subscribe(callback2)

    await service.add(transaction1)

    expect(callback1).toBeCalledWith({
      transaction: transaction1,
      status: "default",
    })
    expect(callback2).toBeCalledWith({
      transaction: transaction1,
      status: "default",
    })
  })

  test("subscribe after transaction added", async () => {
    const callback = vi.fn()

    await service.add(transaction1)
    await service.subscribe(callback)

    expect(callback).not.toBeCalledWith({
      transaction: transaction1,
      status: "default",
    })

    await service.add(transaction2)
    expect(callback).toBeCalledWith({
      transaction: transaction2,
      status: "default",
    })
  })
})
