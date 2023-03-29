import { rest } from "msw"
import { setupServer } from "msw/node"
import { defaultProvider, ec } from "starknet"
import { afterAll, afterEach, beforeAll, describe, it } from "vitest"

import { MultisigAccount } from "./account"
import executeTransactionMock from "./mocks/executeTransaction.mock"

const BASE_URL = "https://cloud-dev.argent-api.com/v1/multisig/starknet"

const server = setupServer(
  rest.post(
    `${BASE_URL}/:starknetNetwork/:address/request`,
    (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(executeTransactionMock))
    },
  ),
  rest.post(
    `${BASE_URL}/:starknetNetwork/:address/request/:requestId/signature`,
    (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          ...executeTransactionMock,
          content: { ...executeTransactionMock.content, state: "SUBMITTED" },
        }),
      )
    },
  ),
)

beforeAll(() => server.listen())
describe("MultisigAccount", () => {
  it("should execute a multisig transaction", async () => {
    const account = new MultisigAccount(
      defaultProvider,
      "0x1234",
      ec.genKeyPair(),
      BASE_URL,
    )

    const response = await account.execute(
      [
        {
          contractAddress: "0x5678",
          entrypoint: "transfer",
          calldata: [100],
        },
      ],
      undefined,
      {
        maxFee: 10,
        nonce: "0",
      },
    )

    expect(response).toEqual({
      requestId: "d3ac7ef8-a102-4550-8667-83b07e000f11",
      transaction_hash: "0x0",
      creator:
        "0x07cd076ed8aef015ae2a470659a59b568589b9c0b84c3e5cfded6abc1cd2bbb7",
    })
  })

  it("should add signature to a multisig transaction", async () => {
    const account = new MultisigAccount(
      defaultProvider,
      "0x1234",
      ec.genKeyPair(),
      BASE_URL,
    )

    const response = await account.addRequestSignature(
      executeTransactionMock.content.id,
      executeTransactionMock.content.transaction,
    )

    expect(response).toEqual({
      ...executeTransactionMock,
      content: { ...executeTransactionMock.content, state: "SUBMITTED" },
    })
  })
})

afterEach(() => server.resetHandlers())
afterAll(() => server.close())
