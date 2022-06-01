import "isomorphic-fetch"

import { Call } from "starknet"
import waitForExpect from "wait-for-expect"

import { ArrayStorage } from "../src/background/storage/array"
import { getTransactionsStatusUpdate } from "../src/background/transactions/determineUpdates"
import { setIntervalAsync } from "../src/background/transactions/setIntervalAsync"
import { nameTransaction } from "../src/background/transactions/transactionNames"
import {
  TransactionTracker,
  getTransactionsTracker,
} from "../src/background/transactions/transactions"
import { FetchTransactions } from "../src/background/transactions/voyager"
import { defaultNetwork } from "../src/shared/networks"
import { Transaction, TransactionRequest } from "../src/shared/transactions"
import { WalletAccount } from "../src/shared/wallet.model"
import { MockStorage } from "./mock"
import transactionsMock from "./transactions.mock.json"

const wallet: WalletAccount = {
  address: "0x05e54edb59e1b1e398f9647e617276f6da0eb9ddfc0c02723269b9baa2489dce",
  network: defaultNetwork,
  signer: {
    derivationPath: "0",
    type: "local_signer",
  },
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const getTransactionsStore = (initialTransactions: Transaction[]) =>
  new ArrayStorage<Transaction>(
    initialTransactions,
    new MockStorage({
      inner: initialTransactions,
    }),
    (a, b) =>
      a.hash === b.hash && a.account.network.id === a.account.network.id,
  )

const fetchMockTransactions: FetchTransactions = async (_, __) =>
  transactionsMock.items

describe("transactions", () => {
  let txTracker: TransactionTracker
  const fn = jest.fn()
  beforeEach(async () => {
    txTracker = await getTransactionsTracker(
      [wallet],
      getTransactionsStore,
      fetchMockTransactions,
      fn,
      1000,
    )
  })
  afterEach(() => {
    fn.mockReset()
    txTracker.stop()
  })
  test("should get all transactions when initializing", async () => {
    const transactions = await txTracker.getAll()
    expect(transactions.length).toBeGreaterThan(5)
    expect(fn).toBeCalledTimes(0)
  })
  test("should get a transaction by hash", async () => {
    const transaction = await txTracker.get(
      "0x16d38d961a659b7565b596060ca812b863a39766accab5a8fd93ace56e6001a",
    )
    expect(transaction).toMatchSnapshot()
    expect(fn).toBeCalledTimes(0)
  })
  test("should add a transaction", async () => {
    const transactionHash =
      "0x16d38d961a659b7565b596060ca812b863a39766accab5a8fd93ace56e6001a" // add a transaction which already exists onchain
    const transaction: TransactionRequest = {
      account: wallet,
      hash: transactionHash,
      meta: {
        title: "test",
        subTitle: "test",
      },
    }
    await txTracker.add(transaction)
    const transactions = await txTracker.get(transactionHash)
    expect(transactions).toMatchObject({
      // after being added, the transaction should be in the store with the default status
      ...transaction,
      status: "RECEIVED",
      timestamp: expect.any(Number),
    })
    expect(fn).toBeCalledTimes(1)
    expect(fn).toBeCalledWith([
      { ...transaction, status: "RECEIVED", timestamp: expect.any(Number) }, // after the update , the transaction should be accepted on L2
    ])

    await waitForExpect(() => {
      expect(fn).toBeCalledTimes(2)
    }, 2000)
    expect(fn).toBeCalledWith([
      { ...transaction, status: "ACCEPTED_ON_L2", timestamp: 1652257464 }, // after the update , the transaction should be accepted on L2
    ])

    await waitForExpect(() => {
      expect(fn).toBeCalledTimes(3)
    }, 2000)
    expect(fn).toBeCalledWith([]) // no update this time, as ACCEPTED_ON_L2 us considered as final status
  })
})

describe("getTransactionsStatusUpdate()", () => {
  const transaction1: Transaction = {
    account: wallet,
    hash: "0x16d38d961a659b7565b596060ca812b863a39766accab5a8fd93ace56e6001a",
    meta: {
      title: "test",
      subTitle: "test",
    },
    status: "RECEIVED",
    timestamp: 1001,
  }
  const transaction2: Transaction = {
    account: wallet,
    hash: "0x26d38d961a659b7565b596060ca812b863a39766accab5a8fd93ace56e6001b",
    meta: {
      title: "test2",
      subTitle: "test2",
    },
    status: "RECEIVED",
    timestamp: 1001,
  }

  test("compare 2 transactions to 2 updated transactions expect 1 change", async () => {
    const transactions: Transaction[] = [transaction1, transaction2]
    const updatedTransactions: Transaction[] = [
      transaction1,
      {
        ...transaction2,
        status: "PENDING",
      },
    ]

    const change = getTransactionsStatusUpdate(
      transactions,
      updatedTransactions,
    )

    expect(change.length).toBe(1)
  })

  test("compare 2 transactions to 1 updated transactions expect 1 change", async () => {
    const transactions: Transaction[] = [transaction1, transaction2]
    const updatedTransactions: Transaction[] = [
      {
        ...transaction2,
        status: "ACCEPTED_ON_L2",
      },
    ]

    const change = getTransactionsStatusUpdate(
      transactions,
      updatedTransactions,
    )

    expect(change.length).toBe(1)
  })

  test("compare 2 transactions to 0 updated transactions expect 0 change", async () => {
    const transactions: Transaction[] = [transaction1, transaction2]
    const updatedTransactions: Transaction[] = []

    const change = getTransactionsStatusUpdate(
      transactions,
      updatedTransactions,
    )

    expect(change.length).toBe(0)
  })

  test("compare 0 transactions to 2 updated transactions expect 2 change", async () => {
    const transactions: Transaction[] = []
    const updatedTransactions: Transaction[] = [transaction1, transaction2]

    const change = getTransactionsStatusUpdate(
      transactions,
      updatedTransactions,
    )

    expect(change.length).toBe(2)
  })
})

describe("setAsyncInterval()", () => {
  test("should run fn every n seconds", async () => {
    const fn = jest.fn()
    const n = 100

    const stop = setIntervalAsync(fn, n)
    expect(fn).toHaveBeenCalledTimes(0)
    await wait(n)
    expect(fn).toHaveBeenCalledTimes(1)
    await wait(n / 2)
    expect(fn).toHaveBeenCalledTimes(1)
    await wait(n / 2)
    expect(fn).toHaveBeenCalledTimes(2)

    stop()
    await wait(n * 2)
    expect(fn).toHaveBeenCalledTimes(2)
  })
})

describe("nameTransaction()", () => {
  test("should return right metadata for 1 transaction", () => {
    const transactions: Call[] = [
      { entrypoint: "transfer_from", contractAddress: "0x0", calldata: [] },
    ]

    const metadata = nameTransaction(transactions)

    expect(metadata).toMatchSnapshot()
  })
  test("should return right metadata for 2 transactions", () => {
    const transactions: Call[] = [
      { entrypoint: "approve", contractAddress: "0x0", calldata: [] },
      { entrypoint: "transfer", contractAddress: "0x0", calldata: [] },
    ]

    const metadata = nameTransaction(transactions)

    expect(metadata).toMatchSnapshot()
  })
})
