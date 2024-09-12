import { describe, expect, test } from "vitest"

import { InMemoryRepository } from "../../storage/__new/__test__/inmemoryImplementations"
import { compareAddressBookContacts } from "../store"
import type { AddressBookContact, AddressBookContactNoId } from "../type"
import { AddressBookService } from "./AddressBookService"

const contactNoId: AddressBookContactNoId = {
  name: "Foo",
  address: "foo.stark",
  networkId: "sepolia-alpha",
}

const contactWithId: AddressBookContact = {
  id: "123",
  name: "Foo",
  address: "foo.stark",
  networkId: "sepolia-alpha",
}

describe("AddressBookService", () => {
  const makeService = () => {
    const addressBookRepo = new InMemoryRepository<AddressBookContact>({
      namespace: "core:addressbook",
      compare: compareAddressBookContacts,
    })
    const addressBookService = new AddressBookService(addressBookRepo)
    return { addressBookService, addressBookRepo }
  }

  describe("add", () => {
    describe("When valid", () => {
      test("Creates amd returns contact with an id", async () => {
        const { addressBookService } = makeService()
        const result = await addressBookService.add(contactNoId)
        const { id, ...rest } = result
        expect(id).toBeDefined()
        expect(rest).toEqual(contactNoId)
      })

      test("Retains contact id if provided", async () => {
        const { addressBookService } = makeService()
        const result = await addressBookService.add(contactWithId)
        expect(result).toEqual(contactWithId)
      })
    })
    describe("When invalid", () => {
      test("Throws a validation error", async () => {
        const { addressBookService } = makeService()
        await expect(
          addressBookService.add({
            name: "foo",
            address: "bar",
            networkId: "baz",
          }),
        ).rejects.toThrow("Invalid address")
      })
    })
  })

  describe("get", () => {
    describe("When valid", () => {
      test("Adds and returns the matching contact", async () => {
        const { addressBookService } = makeService()
        await addressBookService.add(contactWithId)

        const resultAll = await addressBookService.getAll()
        expect(resultAll).toEqual([contactWithId])

        const result = await addressBookService.get(contactWithId)
        expect(result).toEqual(contactWithId)
      })
    })
  })

  describe("update", () => {
    describe("When valid", () => {
      test("Updates the matching contact", async () => {
        const { addressBookService } = makeService()
        await addressBookService.add(contactWithId)

        await addressBookService.update({
          ...contactWithId,
          name: "Bar",
        })

        const [result] = await addressBookService.getAll()
        expect(result.name).toEqual("Bar")
      })
    })
  })

  describe("remove", () => {
    describe("When valid", () => {
      test("Removes and returns the matching contact", async () => {
        const { addressBookService } = makeService()
        await addressBookService.add(contactWithId)

        const result = await addressBookService.remove(contactWithId)
        expect(result).toEqual(contactWithId)

        const resultAll = await addressBookService.getAll()
        expect(resultAll).toEqual([])
      })
    })
  })

  describe("search", () => {
    describe("When valid", () => {
      test("Returns matching contacts", async () => {
        const { addressBookService } = makeService()
        await addressBookService.add({
          id: "123",
          name: "Foo",
          address: "foo.foo.stark",
          networkId: "sepolia-alpha",
        })
        await addressBookService.add({
          id: "456",
          name: "Bar",
          address: "foo.bar.stark",
          networkId: "sepolia-alpha",
        })
        await addressBookService.add({
          id: "789",
          name: "Baz",
          address: "foo.bar.baz.stark",
          networkId: "sepolia-alpha",
        })

        const resultFoo = await addressBookService.search("foo")
        expect(resultFoo).toMatchInlineSnapshot(`
          [
            {
              "address": "foo.foo.stark",
              "id": "123",
              "name": "Foo",
              "networkId": "sepolia-alpha",
            },
            {
              "address": "foo.bar.stark",
              "id": "456",
              "name": "Bar",
              "networkId": "sepolia-alpha",
            },
            {
              "address": "foo.bar.baz.stark",
              "id": "789",
              "name": "Baz",
              "networkId": "sepolia-alpha",
            },
          ]
        `)

        const resultBar = await addressBookService.search("bar")
        expect(resultBar).toMatchInlineSnapshot(`
          [
            {
              "address": "foo.bar.stark",
              "id": "456",
              "name": "Bar",
              "networkId": "sepolia-alpha",
            },
            {
              "address": "foo.bar.baz.stark",
              "id": "789",
              "name": "Baz",
              "networkId": "sepolia-alpha",
            },
          ]
        `)

        const resultBaz = await addressBookService.search("baz")
        expect(resultBaz).toMatchInlineSnapshot(`
          [
            {
              "address": "foo.bar.baz.stark",
              "id": "789",
              "name": "Baz",
              "networkId": "sepolia-alpha",
            },
          ]
        `)
      })
    })
  })
})
