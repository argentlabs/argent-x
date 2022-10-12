import { describe, expect, test } from "vitest"

import { variantPropsMatchesComponentProps } from "./matches"

describe("variantPropsMatchesComponentProps", () => {
  test("should match correctly", () => {
    expect(
      variantPropsMatchesComponentProps({ foo: "bar" }, { foo: "bar" }),
    ).toBeTruthy()
    expect(
      variantPropsMatchesComponentProps({ foo: "bar" }, { foo: "baz" }),
    ).toBeFalsy()
    expect(
      variantPropsMatchesComponentProps([{ foo: "bar" }, { bar: "baz" }], {
        foo: "bar",
      }),
    ).toBeTruthy()
    expect(
      variantPropsMatchesComponentProps([{ foo: "bar" }, { bar: "baz" }], {
        bar: "baz",
      }),
    ).toBeTruthy()
    expect(
      variantPropsMatchesComponentProps([{ foo: "bar" }, { bar: "baz" }], {
        foo: "baz",
      }),
    ).toBeFalsy()
  })
})
