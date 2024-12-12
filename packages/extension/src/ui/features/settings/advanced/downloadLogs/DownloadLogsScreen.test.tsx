import { act, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import browser from "webextension-polyfill"
import { renderWithLegacyProviders } from "../../../../test/utils"
import { DownloadLogsScreen } from "./DownloadLogsScreen"
import * as utils from "./utils"

vi.mock("../../../../../shared/smartAccount/idb", () => ({
  idb: {
    ids: {
      get: vi.fn(() => Promise.resolve("deviceId")),
    },
    devices: {
      get: vi.fn(() => Promise.resolve({ verifiedEmail: "verifiedEmail" })),
    },
  },
}))

vi.mock("../../../../../shared/idb/argentDb", () => ({
  argentDb: {
    tables: [
      {
        name: "table1",
        toArray: vi.fn(() => Promise.resolve([{ data: "data" }])),
      },
    ],
  },
}))

vi.spyOn(browser.storage.local, "get").mockImplementation(
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  vi.fn(() => Promise.resolve({ key: "value" })),
)

describe("DownloadLogsScreen", () => {
  it("renders without crashing", () => {
    act(() => {
      renderWithLegacyProviders(<DownloadLogsScreen />)
    })
    expect(
      screen.getByText(
        "Application logs will help to resolve user support issues",
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        "Sensitive data like your seed phrase and private key is never included",
      ),
    ).toBeInTheDocument()
    const downloadButton = screen.getByRole("button", { name: "Download" })
    expect(downloadButton).toBeInTheDocument()
  })

  it("calls download functions when Download button is clicked", async () => {
    act(() => {
      renderWithLegacyProviders(<DownloadLogsScreen />)
    })

    const downloadFileFn = vi.spyOn(utils, "downloadFile")
    const formatDataFn = vi.spyOn(utils, "formatDataForDownload")
    const getBrowserNameFn = vi.spyOn(utils, "getBrowserName")
    const getOSNameFn = vi.spyOn(utils, "getOSName")

    const downloadButton = screen.getByRole("button", { name: "Download" })
    expect(downloadButton).toBeInTheDocument()
    await userEvent.click(downloadButton)

    expect(downloadFileFn).toHaveBeenCalled()
    expect(formatDataFn).toHaveBeenCalled()
    expect(getBrowserNameFn).toHaveBeenCalled()
    expect(getOSNameFn).toHaveBeenCalled()
  })

  it("logs text is properly formatted", async () => {
    act(() => {
      renderWithLegacyProviders(<DownloadLogsScreen />)
    })
    const mockFormatDataForDownload = vi.spyOn(utils, "formatDataForDownload")
    const downloadButton = screen.getByRole("button", { name: "Download" })
    expect(downloadButton).toBeInTheDocument()
    await userEvent.click(downloadButton)
    expect(mockFormatDataForDownload).toHaveBeenCalled()
    const lastCallArgs =
      mockFormatDataForDownload.mock.calls[
        mockFormatDataForDownload.mock.calls.length - 1
      ]
    const returnValue = utils.formatDataForDownload(...lastCallArgs)
    expect(returnValue.includes("Application logs")).toBe(true)
    expect(returnValue).toContain("App Version")
    expect(returnValue).toContain("Browser")
    expect(returnValue).toContain("Unknown Browser")
    expect(returnValue).toContain("Operating System")
    expect(returnValue).toContain("Device ID")
    expect(returnValue).toContain("deviceId")
    expect(returnValue).toContain("Verified Email")
    expect(returnValue).toContain("verifiedEmail")
    expect(returnValue).toContain("table1")
    expect(returnValue).not.toContain("Just a random string")
  })
})
