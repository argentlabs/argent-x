import { describe, expect, test } from "vitest"

import { IStatusMessage } from "../src/shared/statusMessage/types"
import { getShouldShowMessage } from "../src/ui/features/statusMessage/getShouldShowMessage"

const statusMessageNull: IStatusMessage = {
  id: "310e899a-8f19-43c1-990d-95d87acaecf3",
  updatedAt: "2022-07-19T10:39:30.288Z",
  message: null,
}

const statusMessageInfo: IStatusMessage = {
  id: "310e899a-8f19-43c1-990d-95d87acaecf3",
  updatedAt: "2022-07-19T10:39:30.288Z",
  minVersion: "3.9.2",
  maxVersion: "4.1.0",
  level: "info",
  dismissable: true,
  fullScreen: false,
  summary: "New version available",
  message:
    "A new version of Argent X is available and is a recommended upgrade",
  linkTitle: "Upgrade now",
  linkUrl: "https://argent.xyz/announcements/034",
}

describe("statusMessage", () => {
  describe("getShouldShowMessage", () => {
    test("should return true or false as expected", () => {
      expect(
        getShouldShowMessage({
          statusMessage: statusMessageNull,
        }),
      ).toBeFalsy()
      expect(
        getShouldShowMessage({
          statusMessage: statusMessageInfo,
          version: "3.9.2",
        }),
      ).toBeTruthy()
      expect(
        getShouldShowMessage({
          statusMessage: statusMessageInfo,
          version: "3.9.1",
        }),
      ).toBeFalsy()
      expect(
        getShouldShowMessage({
          statusMessage: statusMessageInfo,
          version: "4.1.0",
        }),
      ).toBeTruthy()
      expect(
        getShouldShowMessage({
          statusMessage: statusMessageInfo,
          version: "4.1.1",
        }),
      ).toBeFalsy()
      expect(
        getShouldShowMessage({
          statusMessage: statusMessageInfo,
          lastDismissedMessageId: statusMessageInfo.id,
          version: "4.1.0",
        }),
      ).toBeFalsy()
    })
  })
})
