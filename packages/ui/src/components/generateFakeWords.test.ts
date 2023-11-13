import { generateFakeWords } from "./generateFakeWords" // Replace 'your_file' with actual file path
import { test, expect, describe } from "vitest"

describe("generateFakeWords", () => {
  test("empty word list", () => {
    const result = generateFakeWords([])
    expect(result).toEqual([])
  })

  test("single word in word list", () => {
    const result = generateFakeWords(["test"], 1)
    expect(result).toEqual(["test"])
  })

  test("multiple words in word list", () => {
    const wordList = ["test1", "test2"]
    const result = generateFakeWords(wordList, 1)
    // expect array of one with a word from the word list
    expect(result.length).toEqual(1)
    expect(wordList.includes(result[0])).toEqual(true)
  })

  test("word list length with junkMultiplier", () => {
    const wordList = ["test1", "test2"]
    const junkMultiplier = 3
    const result = generateFakeWords(wordList, junkMultiplier)
    expect(result.length).toEqual(junkMultiplier)
  })

  // test that the probability of a word being selected is random
  // probability of this test failing, if the probability is random, is very low.
  // 1.36423x10^-10
  // source: https://www.wolframalpha.com/input?i=probability+X+%3C%3D+400+for+X+%7E+binomial%281000%2C+0.5%29
  test("randomness", () => {
    const wordList = ["test1", "test2"]
    const junkMultiplier = 1000
    const result = generateFakeWords(wordList, junkMultiplier)
    const test1Count = result.filter((word) => word === "test1").length
    const test2Count = result.filter((word) => word === "test2").length
    expect(test1Count).toBeGreaterThan(400)
    expect(test2Count).toBeGreaterThan(400)
  })
})
