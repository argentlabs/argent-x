import { describe, expect, test } from "vitest"

import { createMerkleTreeForPolicies } from "../src/main"

describe("createMerkleTreeForPolicies()", () => {
  test("should complete with valid policies", async () => {
    const proof = createMerkleTreeForPolicies([
      {
        contractAddress: "0x1",
        selector: "selector",
      },
    ])
    expect(proof.root).toBe(
      "0x11b9c3da2d94398a5eaafca97b30a3a9517d0b7743b50308d312e3b6416b830",
    )
  })
})
