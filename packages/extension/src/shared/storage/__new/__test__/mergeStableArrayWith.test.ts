import { mergeArrayStableWith } from "../base"

describe("mergeArrayStableWith", () => {
  describe("primitive values", () => {
    test("should merge 2 arrays", () => {
      const arr1 = [1, 2, 3]
      const arr2 = [4, 5, 6]
      const result = mergeArrayStableWith(arr1, arr2)
      expect(result).toEqual([1, 2, 3, 4, 5, 6])
    })
    test("should merge 2 arrays with duplicates in each", () => {
      const arr1 = [1, 2, 3, 3]
      const arr2 = [4, 5, 6, 6]
      const result = mergeArrayStableWith(arr1, arr2)
      expect(result).toEqual([1, 2, 3, 4, 5, 6])
    })
    test("should merge 2 arrays with duplicates", () => {
      const arr1 = [1, 2, 3]
      const arr2 = [3, 4, 5, 6, 6]
      const result = mergeArrayStableWith(arr1, arr2)
      expect(result).toEqual([1, 2, 3, 4, 5, 6])
    })
    test("should merge array with empty array", () => {
      const arr1 = [1, 2, 3]
      const arr2: typeof arr1 = []
      const result = mergeArrayStableWith(arr1, arr2)
      expect(result).toEqual([1, 2, 3])
    })
    test("should merge empty array with array", () => {
      const arr1 = [1, 2, 3]
      const arr2: typeof arr1 = []
      const result = mergeArrayStableWith(arr2, arr1)
      expect(result).toEqual([1, 2, 3])
    })
    test("should merge empty array with empty array", () => {
      const arr1: unknown[] = []
      const arr2: typeof arr1 = []
      const result = mergeArrayStableWith(arr1, arr2)
      expect(result).toEqual([])
    })
  })
  describe("objects", () => {
    test("should merge 2 arrays", () => {
      const arr1: object[] = [{ a: 1 }, { b: 2 }, { c: 3 }]
      const arr2: typeof arr1 = [{ d: 4 }, { e: 5 }, { f: 6 }]
      const result = mergeArrayStableWith(arr1, arr2)
      expect(result).toEqual([
        { a: 1 },
        { b: 2 },
        { c: 3 },
        { d: 4 },
        { e: 5 },
        { f: 6 },
      ])
    })
    test("should merge 2 arrays with duplicates in each", () => {
      const arr1: object[] = [{ a: 1 }, { b: 2 }, { c: 3 }, { c: 3 }]
      const arr2: typeof arr1 = [{ d: 4 }, { e: 5 }, { f: 6 }, { f: 6 }]
      const result = mergeArrayStableWith(arr1, arr2)
      expect(result).toEqual([
        { a: 1 },
        { b: 2 },
        { c: 3 },
        { d: 4 },
        { e: 5 },
        { f: 6 },
      ])
    })
    test("should merge 2 arrays with duplicates", () => {
      const arr1: object[] = [{ a: 1 }, { b: 2 }, { c: 3 }]
      const arr2: typeof arr1 = [
        { c: 3 },
        { d: 4 },
        { e: 5 },
        { f: 6 },
        { f: 6 },
      ]
      const result = mergeArrayStableWith(arr1, arr2)
      expect(result).toEqual([
        { a: 1 },
        { b: 2 },
        { c: 3 },
        { d: 4 },
        { e: 5 },
        { f: 6 },
      ])
    })
    test("should merge array with empty array", () => {
      const arr1: object[] = [{ a: 1 }, { b: 2 }, { c: 3 }]
      const arr2: typeof arr1 = []
      const result = mergeArrayStableWith(arr1, arr2)
      expect(result).toEqual([{ a: 1 }, { b: 2 }, { c: 3 }])
    })
    test("should merge empty array with array", () => {
      const arr1: object[] = [{ a: 1 }, { b: 2 }, { c: 3 }]
      const arr2: typeof arr1 = []
      const result = mergeArrayStableWith(arr2, arr1)
      expect(result).toEqual([{ a: 1 }, { b: 2 }, { c: 3 }])
    })
  })
  describe("objects with custom compare function", () => {
    interface AdvancedObject {
      id: number
      value: string
    }
    function compareFn(a: AdvancedObject, b: AdvancedObject): boolean {
      return a.id === b.id
    }

    test("should merge 2 arrays", () => {
      const arr1: AdvancedObject[] = [
        { id: 1, value: "a" },
        { id: 2, value: "b" },
        { id: 3, value: "c" },
      ]
      const arr2: AdvancedObject[] = [
        { id: 4, value: "d" },
        { id: 5, value: "e" },
        { id: 6, value: "f" },
      ]
      const result = mergeArrayStableWith(arr1, arr2, { compareFn })
      expect(result).toEqual([
        { id: 1, value: "a" },
        { id: 2, value: "b" },
        { id: 3, value: "c" },
        { id: 4, value: "d" },
        { id: 5, value: "e" },
        { id: 6, value: "f" },
      ])
    })
    test("should merge 2 arrays with duplicates in each", () => {
      const arr1: AdvancedObject[] = [
        { id: 1, value: "a" },
        { id: 2, value: "b" },
        { id: 3, value: "c" },
        { id: 3, value: "c1" },
      ]
      const arr2: AdvancedObject[] = [
        { id: 4, value: "d" },
        { id: 5, value: "e" },
        { id: 6, value: "f" },
        { id: 6, value: "f1" },
      ]
      const result = mergeArrayStableWith(arr1, arr2, { compareFn })
      expect(result).toEqual([
        // last occurence of each element is kept
        { id: 1, value: "a" },
        { id: 2, value: "b" },
        { id: 3, value: "c1" },
        { id: 4, value: "d" },
        { id: 5, value: "e" },
        { id: 6, value: "f1" },
      ])
    })
    test("should merge 2 arrays with duplicates", () => {
      const arr1: AdvancedObject[] = [
        { id: 1, value: "a" },
        { id: 2, value: "b" },
        { id: 3, value: "c" },
      ]
      const arr2: AdvancedObject[] = [
        { id: 1, value: "a1" },
        { id: 4, value: "d" },
        { id: 5, value: "e" },
        { id: 6, value: "f" },
        { id: 6, value: "f1" },
      ]
      const result = mergeArrayStableWith(arr1, arr2, { compareFn })
      expect(result).toEqual([
        // last occurence of each element is kept
        { id: 1, value: "a1" },
        { id: 2, value: "b" },
        { id: 3, value: "c" },
        { id: 4, value: "d" },
        { id: 5, value: "e" },
        { id: 6, value: "f1" },
      ])
    })
  })
  describe("objects with custom compare function and merge function", () => {
    interface AdvancedObject {
      id: number
      value: string
    }
    function compareFn(a: AdvancedObject, b: AdvancedObject): boolean {
      return a.id === b.id
    }
    function mergeFn(a: AdvancedObject, b: AdvancedObject): AdvancedObject {
      return { id: a.id, value: `${a.value}${b.value}` }
    }

    test("should merge 2 arrays", () => {
      const arr1: AdvancedObject[] = [
        { id: 1, value: "a" },
        { id: 2, value: "b" },
        { id: 3, value: "c" },
      ]
      const arr2: AdvancedObject[] = [
        { id: 4, value: "d" },
        { id: 5, value: "e" },
        { id: 6, value: "f" },
      ]
      const result = mergeArrayStableWith(arr1, arr2, { compareFn, mergeFn })
      expect(result).toEqual([
        { id: 1, value: "a" },
        { id: 2, value: "b" },
        { id: 3, value: "c" },
        { id: 4, value: "d" },
        { id: 5, value: "e" },
        { id: 6, value: "f" },
      ])
    })
    test("should merge 2 arrays with duplicates in each", () => {
      const arr1: AdvancedObject[] = [
        { id: 1, value: "a" },
        { id: 2, value: "b" },
        { id: 3, value: "c" },
        { id: 3, value: "c1" },
      ]
      const arr2: AdvancedObject[] = [
        { id: 4, value: "d" },
        { id: 5, value: "e" },
        { id: 6, value: "f" },
        { id: 6, value: "f1" },
      ]
      const result = mergeArrayStableWith(arr1, arr2, { compareFn, mergeFn })
      expect(result).toEqual([
        // last occurence of each element is kept
        { id: 1, value: "a" },
        { id: 2, value: "b" },
        { id: 3, value: "cc1" },
        { id: 4, value: "d" },
        { id: 5, value: "e" },
        { id: 6, value: "ff1" },
      ])
    })
  })
})
