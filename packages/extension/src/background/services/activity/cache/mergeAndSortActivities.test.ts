import {
  NativeActivityTypeNative,
  type AnyActivity,
} from "@argent/x-shared/simulation"
import { describe, expect, test } from "vitest"

import { mergeAndSortActivities } from "./mergeAndSortActivities"

describe("services/activity/cache", () => {
  describe("mergeAndSortActivities", () => {
    describe("when valid", () => {
      test("should merge and sort as expected", () => {
        const source = [
          {
            type: NativeActivityTypeNative,
            status: "pending",
            submitted: 1,
            transaction: {
              hash: "0x1",
            },
            meta: {
              title: "One",
            },
          },
          {
            status: "pending",
            submitted: 4,
            transaction: {
              hash: "0x4",
            },
          },
          {
            type: NativeActivityTypeNative,
            status: "success",
            submitted: 2,
            transaction: {
              hash: "0x2",
            },
          },
          {
            status: "pending",
            submitted: 4,
            transaction: {
              hash: "0x4",
            },
          },
          {
            submitted: 5,
            status: "success",
            transaction: {
              hash: "0x5",
            },
          },
          {
            type: NativeActivityTypeNative,
            status: "success",
            submitted: 6,
            transaction: {
              hash: "0x6",
            },
            meta: {
              title: "Six",
            },
          },
        ] as unknown as AnyActivity[]
        const other = [
          {
            status: "success",
            submitted: 1,
            transaction: {
              hash: "0x1",
            },
          },
          {
            submitted: 4,
            status: "success",
            transaction: {
              hash: "0x4",
            },
          },
          {
            submitted: 2,
            status: "pending",
            transaction: {
              hash: "0x2",
            },
            title: "Two (Other)",
          },
          {
            submitted: 6,
            status: "success",
            transaction: {
              hash: "0x6",
            },
            title: "Six (Other)",
          },
          {
            type: NativeActivityTypeNative,
            status: "rejected",
            submitted: 5,
            transaction: {
              hash: "0x5",
            },
            meta: {
              title: "Five (Other)",
            },
          },
        ] as unknown as AnyActivity[]
        expect(mergeAndSortActivities(source, other)).toMatchInlineSnapshot(`
          [
            {
              "meta": {
                "title": "Six",
              },
              "status": "success",
              "submitted": 6,
              "transaction": {
                "hash": "0x6",
              },
              "type": "native",
            },
            {
              "meta": {
                "title": "Five (Other)",
              },
              "status": "rejected",
              "submitted": 5,
              "transaction": {
                "hash": "0x5",
              },
              "type": "native",
            },
            {
              "status": "success",
              "submitted": 4,
              "transaction": {
                "hash": "0x4",
              },
            },
            {
              "meta": {
                "title": "Two (Other)",
              },
              "status": "success",
              "submitted": 2,
              "transaction": {
                "hash": "0x2",
              },
              "type": "native",
            },
            {
              "meta": {
                "title": "One",
              },
              "status": "success",
              "submitted": 1,
              "transaction": {
                "hash": "0x1",
              },
              "type": "native",
            },
          ]
        `)
      })
    })
    test("should keep fees from backend when merging with local activity", () => {
      const source = [
        {
          type: NativeActivityTypeNative,
          status: "pending",
          submitted: 1,
          transaction: {
            hash: "0x1",
          },
        },
      ] as unknown as AnyActivity[]
      const other = [
        {
          status: "success",
          submitted: 1,
          transaction: {
            hash: "0x1",
          },
          fees: {
            amount: "1",
            fiatAmount: {
              currency: "USD",
              currencyAmount: "1",
            },
          },
        },
      ] as unknown as AnyActivity[]
      expect(mergeAndSortActivities(source, other)).toEqual([
        {
          fees: {
            amount: "1",
            fiatAmount: {
              currency: "USD",
              currencyAmount: "1",
            },
          },
          status: "success",
          submitted: 1,
          transaction: {
            hash: "0x1",
          },
          type: "native",
        },
      ])
    })
  })
})
