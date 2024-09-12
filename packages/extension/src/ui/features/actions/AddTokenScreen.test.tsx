import { act, fireEvent, screen } from "@testing-library/react"
import { describe } from "vitest"
import { z } from "zod"

import { renderWithLegacyProviders } from "../../test/utils"
import { AddTokenScreen, AddTokenScreenSchema } from "./AddTokenScreen"

const validTokenSchema = {
  address: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  name: "Ether",
  symbol: "ETH",
  decimals: "18",
}

describe("AddTokenScreenSchema", () => {
  describe("when valid", () => {
    it("Success abd converts decimals string to number", () => {
      const result = AddTokenScreenSchema.safeParse(validTokenSchema)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.decimals).toEqual(18)
      }
    })
  })
  describe("when invalid", () => {
    it("Returns invalid address", () => {
      const result = AddTokenScreenSchema.safeParse({
        ...validTokenSchema,
        address: "foo",
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeInstanceOf(z.ZodError)
      }
    })
    it("Returns invalid decimals", () => {
      const result = AddTokenScreenSchema.safeParse({
        ...validTokenSchema,
        decimals: "foo",
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeInstanceOf(z.ZodError)
      }
    })
  })
})

describe("AddTokenScreen", () => {
  it("Calls expected methods when buttons are clicked", async () => {
    const onFormSubmit = vi.fn()
    const onReject = vi.fn()
    const onTokenAddressChange = vi.fn()

    const { container } = renderWithLegacyProviders(
      <AddTokenScreen
        onContinue={onFormSubmit}
        onReject={onReject}
        onTokenAddressChange={onTokenAddressChange}
        isLoading={false}
        isExistingToken={false}
      />,
    )

    await act(async () => {
      fireEvent.click(screen.getByText(/^Reject/))
    })
    expect(onReject).toHaveBeenCalled()

    const addressElement = container.querySelector(`input[name="address"]`)
    if (addressElement) {
      fireEvent.change(addressElement, {
        target: { value: validTokenSchema.address },
      })
      expect(onTokenAddressChange).toHaveBeenCalledWith(
        validTokenSchema.address,
      )
    }

    const nameElement = container.querySelector(`input[name="name"]`)
    if (nameElement) {
      fireEvent.change(nameElement, {
        target: { value: validTokenSchema.name },
      })
    }

    const symbolElement = container.querySelector(`input[name="symbol"]`)
    if (symbolElement) {
      fireEvent.change(symbolElement, {
        target: { value: validTokenSchema.symbol },
      })
    }

    const decimalsElement = container.querySelector(`input[name="decimals"]`)
    if (decimalsElement) {
      fireEvent.change(decimalsElement, {
        target: { value: validTokenSchema.decimals },
      })
    }

    await act(async () => {
      screen.getByRole("button", { name: "Add token" }).click()
    })

    expect(onFormSubmit).toHaveBeenCalledWith({
      ...validTokenSchema,
      decimals: 18,
    })
  })
})
