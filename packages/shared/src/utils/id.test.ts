import { test } from "vitest"
import { id } from "./id"

test("id", () => {
  const identifier = id("hello world")
  expect(identifier).toMatchInlineSnapshot(
    '"0x47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad"',
  )
})
