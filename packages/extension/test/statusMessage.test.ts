import { describe, expect, test } from "vitest"

import type { IStatusMessage } from "../src/shared/statusMessage/types"
import {
  getMessageToShow,
  getShouldShowMessage,
} from "../src/ui/features/statusMessage/statusMessageVisibility"
import statusMessageInfo from "./__fixtures__/status-message-info.json"
import statusMessageMultiple from "./__fixtures__/status-message-multiple.json"
import statusMessageNoVersion from "./__fixtures__/status-message-no-version.json"
import statusMessageNull from "./__fixtures__/status-message-null.json"

describe("statusMessage", () => {
  describe("getShouldShowMessage", () => {
    describe("when valid", () => {
      describe("when given a single message", () => {
        describe("and the message is null", () => {
          test("should return false", () => {
            expect(
              getShouldShowMessage({
                statusMessage: statusMessageNull,
              }),
            ).toBeFalsy()
          })
        })
        describe("and the message does not specify version(s)", () => {
          test("should return true unless dismissed", () => {
            expect(
              getShouldShowMessage({
                statusMessage: statusMessageNoVersion as IStatusMessage,
                version: "4.1.0",
              }),
            ).toBeTruthy()
            expect(
              getShouldShowMessage({
                statusMessage: statusMessageNoVersion as IStatusMessage,
                lastDismissedMessageId: statusMessageNoVersion.id,
                version: "4.1.0",
              }),
            ).toBeFalsy()
          })
        })
        describe("and the message specifies version(s)", () => {
          test("should return true when version is within range", () => {
            expect(
              getShouldShowMessage({
                statusMessage: statusMessageInfo as IStatusMessage,
                version: "3.9.2",
              }),
            ).toBeTruthy()
            expect(
              getShouldShowMessage({
                statusMessage: statusMessageInfo as IStatusMessage,
                version: "3.9.1",
              }),
            ).toBeFalsy()
            expect(
              getShouldShowMessage({
                statusMessage: statusMessageInfo as IStatusMessage,
                version: "4.1.0",
              }),
            ).toBeTruthy()
            expect(
              getShouldShowMessage({
                statusMessage: statusMessageInfo as IStatusMessage,
                version: "4.1.1",
              }),
            ).toBeFalsy()
            expect(
              getShouldShowMessage({
                statusMessage: statusMessageInfo as IStatusMessage,
                lastDismissedMessageId: statusMessageInfo.id,
                version: "4.1.0",
              }),
            ).toBeFalsy()
          })
        })
      })
      describe("when given multiple messages", () => {
        test("should return true or false as expected", () => {
          expect(
            getShouldShowMessage({
              statusMessage: statusMessageMultiple as IStatusMessage[],
              version: "1.0.0",
            }),
          ).toBeTruthy()
          expect(
            getShouldShowMessage({
              statusMessage: statusMessageMultiple as IStatusMessage[],
              version: "1.1.0",
            }),
          ).toBeTruthy()
          expect(
            getShouldShowMessage({
              statusMessage: statusMessageMultiple as IStatusMessage[],
              version: "0.9.0",
            }),
          ).toBeFalsy()
          expect(
            getShouldShowMessage({
              statusMessage: statusMessageMultiple as IStatusMessage[],
              version: "2.1.0",
            }),
          ).toBeFalsy()
        })
      })
    })
    describe("when invalid", () => {
      test("should return false without throwing", () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(getShouldShowMessage({ statusMessage: undefined })).toBeFalsy()
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(getShouldShowMessage({ statusMessage: {} })).toBeFalsy()
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(getShouldShowMessage({ statusMessage: null })).toBeFalsy()
        expect(getShouldShowMessage({ statusMessage: [] })).toBeFalsy()
      })
    })
  })
  describe("getMessageToShow", () => {
    describe("when valid", () => {
      describe("when given a single message", () => {
        describe("and the version is within range", () => {
          test("should return the message", () => {
            expect(
              getMessageToShow({
                statusMessage: statusMessageInfo as IStatusMessage,
                version: "3.9.2",
              }),
            ).toEqual(statusMessageInfo)
            expect(
              getMessageToShow({
                statusMessage: statusMessageInfo as IStatusMessage,
                version: "4.1.0",
              }),
            ).toEqual(statusMessageInfo)
          })
        })
        describe("and the version is outside range", () => {
          test("should return undefined", () => {
            expect(
              getMessageToShow({
                statusMessage: statusMessageInfo as IStatusMessage,
                version: "3.9.1",
              }),
            ).toBeUndefined()
            expect(
              getMessageToShow({
                statusMessage: statusMessageInfo as IStatusMessage,
                version: "4.1.1",
              }),
            ).toBeUndefined()
          })
        })
      })
      describe("when given multiple messages", () => {
        describe("and the version is within range", () => {
          test("should return the message", () => {
            expect(
              getMessageToShow({
                statusMessage: statusMessageMultiple as IStatusMessage[],
                version: "1.0.0",
              }),
            ).toEqual(statusMessageMultiple[0])
            expect(
              getMessageToShow({
                statusMessage: statusMessageMultiple as IStatusMessage[],
                version: "1.1.0",
              }),
            ).toEqual(statusMessageMultiple[1])
          })
        })
        describe("and the version is outside range", () => {
          test("should return undefined", () => {
            expect(
              getMessageToShow({
                statusMessage: statusMessageMultiple as IStatusMessage[],
                version: "0.9.0",
              }),
            ).toBeUndefined()
            expect(
              getMessageToShow({
                statusMessage: statusMessageMultiple as IStatusMessage[],
                version: "2.0.1",
              }),
            ).toBeUndefined()
          })
        })
      })
    })
    describe("when invalid", () => {
      test("should return undefined without throwing", () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(getMessageToShow({ statusMessage: undefined })).toBeUndefined()
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(getMessageToShow({ statusMessage: {} })).toBeUndefined()
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(getMessageToShow({ statusMessage: null })).toBeUndefined()
        expect(getMessageToShow({ statusMessage: [] })).toBeUndefined()
      })
    })
  })
})
