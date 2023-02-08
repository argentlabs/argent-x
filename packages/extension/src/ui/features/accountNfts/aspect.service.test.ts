import { rest } from "msw"
import { setupServer } from "msw/node"
import { afterEach, describe, expect, it } from "vitest"

import {
  emptyJson,
  expectedValidRes,
  invalidJson,
  mockAddress,
  validJson,
} from "./aspect.mock"
import { fetchNextAspectNftsByUrl } from "./aspect.service"

const BASE_URL_ENDPOINT = "https://api-testnet.aspect.co/api/v0/assets/"
const INVALID_URL_ENDPOINT = BASE_URL_ENDPOINT + "INVALID"
const EMPTY_URL_ENDPOINT = BASE_URL_ENDPOINT + "EMPTY"
const BASE_URL_WITH_WILDCARD = BASE_URL_ENDPOINT + "*"

const server = setupServer(
  rest.get(INVALID_URL_ENDPOINT, (req, res, ctx) => {
    return res(ctx.json(invalidJson))
  }),
  rest.get(EMPTY_URL_ENDPOINT, (req, res, ctx) => {
    return res(ctx.json(emptyJson))
  }),
  rest.get(BASE_URL_WITH_WILDCARD, (req, res, ctx) => {
    return res(ctx.json(validJson))
  }),
)

beforeAll(() => {
  server.listen()
})
describe("fetchNextAspectNftsByUrl", () => {
  it("fetches and adadpts the next aspect NFTs being given a correct url and a correct response", async () => {
    const res = await fetchNextAspectNftsByUrl(BASE_URL_ENDPOINT, mockAddress)
    expect(res).toEqual(expectedValidRes)
  })
  it("throws when response data types change", async () => {
    expect(() =>
      fetchNextAspectNftsByUrl(INVALID_URL_ENDPOINT, mockAddress),
    ).rejects.toThrowError(`Expected string, received number`)
  })
  it("returns an empty array when no assets are returned by the endpoint", async () => {
    const res = await fetchNextAspectNftsByUrl(EMPTY_URL_ENDPOINT, mockAddress)
    expect(res).toStrictEqual([])
  })
})

afterAll(() => server.close())

afterEach(() => server.resetHandlers())
