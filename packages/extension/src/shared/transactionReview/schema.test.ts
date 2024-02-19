import { describe, expect, test } from "vitest"

import simulationResponse from "./__fixtures__/simulation.json"
import simulationErrorResponse from "./__fixtures__/simulation-error.json"
import {
  TransactionReviewTransaction,
  isNotTransactionSimulationError,
  isTransactionSimulationError,
  simulateAndReviewSchema,
  getMessageFromSimulationError,
} from "./schema"

const missingSimulationResponse = {
  transactions: [
    {
      reviewOfTransaction:
        simulationResponse.transactions[0].reviewOfTransaction,
    },
  ],
}

const bothSimulationAndErrorResponse = {
  transactions: [
    {
      reviewOfTransaction:
        simulationResponse.transactions[0].reviewOfTransaction,
      simulation: simulationResponse.transactions[0].simulation,
      simulationError: simulationErrorResponse.transactions[0].simulationError,
    },
  ],
}

describe("transactionReview/schema", () => {
  describe("simulateAndReviewSchema", () => {
    describe("when valid", () => {
      test("success should be true", () => {
        expect(
          simulateAndReviewSchema.safeParse(simulationResponse).success,
        ).toBeTruthy()
        expect(
          simulateAndReviewSchema.safeParse(simulationErrorResponse).success,
        ).toBeTruthy()
      })
    })
    describe("when invalid", () => {
      describe("and simulation is missing", () => {
        test("success should be false", () => {
          expect(
            simulateAndReviewSchema.safeParse(missingSimulationResponse)
              .success,
          ).toBeFalsy()
        })
      })
      describe("and there is both simulation and simulationError", () => {
        test("success should be false", () => {
          expect(
            simulateAndReviewSchema.safeParse(bothSimulationAndErrorResponse)
              .success,
          ).toBeFalsy()
        })
      })
    })
  })
  describe("isNotTransactionSimulationError", () => {
    describe("when valid", () => {
      test("returns true", () => {
        expect(
          isNotTransactionSimulationError(
            simulationResponse
              .transactions[0] as unknown as TransactionReviewTransaction,
          ),
        ).toBeTruthy()
      })
    })
    describe("when invalid", () => {
      test("returns false", () => {
        expect(
          isNotTransactionSimulationError(
            simulationErrorResponse
              .transactions[0] as TransactionReviewTransaction,
          ),
        ).toBeFalsy()
      })
    })
  })
  describe("isTransactionSimulationError", () => {
    describe("when valid", () => {
      test("returns true", () => {
        expect(
          isTransactionSimulationError(
            simulationErrorResponse
              .transactions[0] as TransactionReviewTransaction,
          ),
        ).toBeTruthy()
      })
    })
    describe("when invalid", () => {
      test("returns false", () => {
        expect(
          isTransactionSimulationError(
            simulationResponse
              .transactions[0] as unknown as TransactionReviewTransaction,
          ),
        ).toBeFalsy()
      })
    })
  })
  describe("getMessageFromSimulationError", () => {
    test("given simulation error with error key, should use it in the returned message", () => {
      expect(
        getMessageFromSimulationError({
          code: 10,
          message: "foo",
          error: "bar",
        }),
      ).toBe("bar")
    })
    test("given simulation error without error key, but with code and message, should use them in the returned message", () => {
      expect(
        getMessageFromSimulationError({
          code: 10,
          message: "foo",
        }),
      ).toBe("10: foo")
    })
    test("given simulation error without error key and code, should return fallback message", () => {
      expect(getMessageFromSimulationError({ message: "foo" })).toBe(
        "Unknown error",
      )
    })
    test("given simulation error without error key and message, should return fallback message", () => {
      expect(getMessageFromSimulationError({ code: 10 })).toBe("Unknown error")
    })
    test("given simulation error without any data, should return fallback message", () => {
      expect(getMessageFromSimulationError({})).toBe("Unknown error")
    })
  })
})
