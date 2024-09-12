import { describe, it, expect } from "vitest"
import { pipe } from "./pipe"

const double = (num: number) => num * 2
const square = (num: number) => num ** 2
const parse = (str: string) => parseInt(str, 10)
const toString = (num: number) => `Number: ${num}`

describe("pipe function", () => {
  it("should handle an empty function array", () => {
    const piped = pipe()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(piped("test")).toBe("test")
  })

  it("should handle single function", () => {
    const piped = pipe(double)
    expect(piped(2)).toBe(4)
  })

  it("should correctly pipe multiple functions", () => {
    const piped = pipe(double, square)
    expect(piped(2)).toBe(16) // (2 * 2) ** 2
  })

  it("should ensure the returned function has the correct type", () => {
    const piped = pipe(parse, double, toString)
    const result: string = piped("5")
    expect(result).toBe("Number: 10")
  })
})
