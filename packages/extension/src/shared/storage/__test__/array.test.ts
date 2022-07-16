import { ArrayStorage } from "../array"

describe("ArrayStorage()", () => {
  describe("with primitives", () => {
    let arrayStorage: ArrayStorage<number>
    beforeAll(() => {
      arrayStorage = new ArrayStorage([1, 2, 3], "arrayNumberTest")
    })

    test("should return defaults", async () => {
      expect(await arrayStorage.get()).toEqual([1, 2, 3])
    })
    test("should get with selector", async () => {
      expect(await arrayStorage.get((x) => x % 2 === 0)).toEqual([2])
    })
    test("should unshift single value", async () => {
      await arrayStorage.unshift(0)
      expect(await arrayStorage.get()).toEqual([0, 1, 2, 3])
    })
    test("should push single value", async () => {
      await arrayStorage.push(4)
      expect(await arrayStorage.get()).toEqual([0, 1, 2, 3, 4])
    })
    test("should push multiple values", async () => {
      await arrayStorage.push([5, 6])
      expect(await arrayStorage.get()).toEqual([0, 1, 2, 3, 4, 5, 6])
    })
    test("try to push a duplicate as part of multiple values", async () => {
      await arrayStorage.push([5, 6, 4])
      expect(await arrayStorage.get()).toEqual([0, 1, 2, 3, 4, 5, 6])
    })
    test("should push with selector function", async () => {
      await arrayStorage.push((value) => value.map((v) => v * 10))
      expect(await arrayStorage.get()).toEqual([
        0, 1, 2, 3, 4, 5, 6, 10, 20, 30, 40, 50, 60,
      ])
    })
    test("should remove single value", async () => {
      await arrayStorage.remove(4)
      expect(await arrayStorage.get()).toEqual([
        0, 1, 2, 3, 5, 6, 10, 20, 30, 40, 50, 60,
      ])
    })
    test("should remove multiple values", async () => {
      await arrayStorage.remove([5, 6])
      expect(await arrayStorage.get()).toEqual([
        0, 1, 2, 3, 10, 20, 30, 40, 50, 60,
      ])
    })
    test("should remove with selector function", async () => {
      await arrayStorage.remove((value) => value % 10 === 0)
      expect(await arrayStorage.get()).toEqual([1, 2, 3])
    })
  })
  describe("object with subscriptions and custom compare function", () => {
    interface AdvancedObject {
      id: number
      value: string
    }
    let arrayStorage: ArrayStorage<AdvancedObject>
    const onChangeHandler = vi.fn()
    let unsub: () => void
    beforeAll(() => {
      arrayStorage = new ArrayStorage(
        [
          { id: 1, value: "a" },
          { id: 2, value: "b" },
          { id: 3, value: "c" },
        ],
        {
          namespace: "arrayAdvancedObjectTest",
          compare: (a, b) => a.id === b.id,
        },
      )
      unsub = arrayStorage.subscribe(onChangeHandler)
    })
    afterAll(() => {
      unsub()
    })
    test("should return defaults", async () => {
      expect(await arrayStorage.get()).toEqual([
        { id: 1, value: "a" },
        { id: 2, value: "b" },
        { id: 3, value: "c" },
      ])
      expect(onChangeHandler).toHaveBeenCalledTimes(0)
    })
    test("should get with selector", async () => {
      expect(await arrayStorage.get((x) => x.id % 2 === 0)).toEqual([
        { id: 2, value: "b" },
      ])
      expect(onChangeHandler).toHaveBeenCalledTimes(0)
    })
    test("should push single value", async () => {
      await arrayStorage.push({ id: 4, value: "d" })
      expect(await arrayStorage.get()).toEqual([
        { id: 1, value: "a" },
        { id: 2, value: "b" },
        { id: 3, value: "c" },
        { id: 4, value: "d" },
      ])
      expect(onChangeHandler).toHaveBeenCalledTimes(1)
      expect(onChangeHandler).toHaveBeenCalledWith(
        [
          { id: 1, value: "a" },
          { id: 2, value: "b" },
          { id: 3, value: "c" },
          { id: 4, value: "d" },
        ],
        expect.anything(),
      )
    })
    test("should push multiple values", async () => {
      await arrayStorage.push([
        { id: 5, value: "e" },
        { id: 6, value: "f" },
      ])
      expect(await arrayStorage.get()).toEqual([
        { id: 1, value: "a" },
        { id: 2, value: "b" },
        { id: 3, value: "c" },
        { id: 4, value: "d" },
        { id: 5, value: "e" },
        { id: 6, value: "f" },
      ])
    })
    test("should push with selector function", async () => {
      await arrayStorage.push((value) =>
        value.map((v) => ({ id: v.id * 10, value: v.value + "x" })),
      )
      expect(await arrayStorage.get()).toEqual([
        { id: 1, value: "a" },
        { id: 2, value: "b" },
        { id: 3, value: "c" },
        { id: 4, value: "d" },
        { id: 5, value: "e" },
        { id: 6, value: "f" },
        { id: 10, value: "ax" },
        { id: 20, value: "bx" },
        { id: 30, value: "cx" },
        { id: 40, value: "dx" },
        { id: 50, value: "ex" },
        { id: 60, value: "fx" },
      ])
    })
    test("should remove single value", async () => {
      await arrayStorage.remove({ id: 4, value: "does not exist" })
      expect(await arrayStorage.get()).toEqual([
        { id: 1, value: "a" },
        { id: 2, value: "b" },
        { id: 3, value: "c" },
        { id: 5, value: "e" },
        { id: 6, value: "f" },
        { id: 10, value: "ax" },
        { id: 20, value: "bx" },
        { id: 30, value: "cx" },
        { id: 40, value: "dx" },
        { id: 50, value: "ex" },
        { id: 60, value: "fx" },
      ])
      expect(onChangeHandler).toHaveBeenCalledTimes(4)
      expect(onChangeHandler).toHaveBeenCalledWith(
        [
          { id: 1, value: "a" },
          { id: 2, value: "b" },
          { id: 3, value: "c" },
          { id: 5, value: "e" },
          { id: 6, value: "f" },
          { id: 10, value: "ax" },
          { id: 20, value: "bx" },
          { id: 30, value: "cx" },
          { id: 40, value: "dx" },
          { id: 50, value: "ex" },
          { id: 60, value: "fx" },
        ],
        expect.anything(),
      )
    })
    test("should remove multiple values", async () => {
      await arrayStorage.remove([
        { id: 5, value: "ex" },
        { id: 6, value: "fx" },
      ])
      expect(await arrayStorage.get()).toEqual([
        { id: 1, value: "a" },
        { id: 2, value: "b" },
        { id: 3, value: "c" },
        { id: 10, value: "ax" },
        { id: 20, value: "bx" },
        { id: 30, value: "cx" },
        { id: 40, value: "dx" },
        { id: 50, value: "ex" },
        { id: 60, value: "fx" },
      ])
    })
    test("should remove with selector function", async () => {
      await arrayStorage.remove((value) => value.id % 10 === 0)
      expect(await arrayStorage.get()).toEqual([
        { id: 1, value: "a" },
        { id: 2, value: "b" },
        { id: 3, value: "c" },
      ])
    })
    test("should update duplicates", async () => {
      await arrayStorage.push([{ id: 1, value: "au" }])
      expect(await arrayStorage.get()).toEqual([
        { id: 1, value: "au" },
        { id: 2, value: "b" },
        { id: 3, value: "c" },
      ])
      expect(onChangeHandler).toHaveBeenCalledTimes(7)
      expect(onChangeHandler).toHaveBeenCalledWith(
        [
          { id: 1, value: "au" },
          { id: 2, value: "b" },
          { id: 3, value: "c" },
        ],
        expect.anything(),
      )
    })
    test("should not emit event when unsubscribed", async () => {
      unsub()
      await arrayStorage.push([{ id: 1, value: "au" }])
      expect(await arrayStorage.get()).toEqual([
        { id: 1, value: "au" },
        { id: 2, value: "b" },
        { id: 3, value: "c" },
      ])
      expect(onChangeHandler).toHaveBeenCalledTimes(7)
    })
  })
})
