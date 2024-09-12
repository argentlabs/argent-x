import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import * as router from "react-router-dom"
import { MemoryRouter } from "react-router-dom"
import { getMockWalletAccount } from "../../../../test/walletAccount.mock"
import { defaultNetwork } from "../../../shared/network"
import * as useRouteFile from "../../hooks/useRoute"
import * as routes1 from "../../../shared/ui/routes"
import OnboardingSmartAccountEmailScreen from "./OnboardingSmartAccountEmailScreen"
import OnboardingSmartAccountOTPScreen from "./OnboardingSmartAccountOTPScreen"

const mockWalletAccount = getMockWalletAccount()

const mockCreateAccountAction = vi.fn(() => Promise.resolve(mockWalletAccount))

vi.mock("../networks/hooks/useCurrentNetwork", () => ({
  useCurrentNetwork: vi.fn(() => defaultNetwork),
}))

vi.mock("../../hooks/useAction", () => ({
  useAction: vi.fn(() => ({
    action: mockCreateAccountAction,
    loading: false,
  })),
}))

vi.mock("../../../shared/smartAccount/jwt", () => ({
  resetDevice: vi.fn(),
}))

vi.mock("../../services/argentAccount", () => ({
  clientArgentAccountService: {
    confirmEmail: vi.fn(() => Promise.resolve()),
    validateAccount: vi.fn(() => Promise.resolve()),
    addGuardianToAccount: vi.fn(() => Promise.resolve()),
    requestEmail: vi.fn(),
  },
}))

vi.mock("../../../shared/smartAccount/verifiedEmail", () => ({
  updateVerifiedEmail: vi.fn(),
}))

const email = "test@argent.xyz"
vi.spyOn(useRouteFile, "useRouteEmailAddress").mockReturnValue(email)

describe("OnboardingSmartAccountEmailScreen", () => {
  it("Should navigate to the otp screen on create smart account", async () => {
    act(() => {
      render(
        <MemoryRouter>
          <OnboardingSmartAccountEmailScreen />
          <router.Routes>
            <router.Route
              path={routes1.routes.onboardingSmartAccountOTP.path}
              element={<OnboardingSmartAccountOTPScreen />}
            />
          </router.Routes>
        </MemoryRouter>,
      )
    })

    expect(screen.getByText("Enter your email")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument()

    const emailInput = screen.getByTestId("email-input")

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: email } })
    })

    screen.getByRole("button", { name: "Continue" }).click()

    await waitFor(() => screen.getByText("Check your email"))

    expect(screen.getByText("Check your email")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Resend code" }),
    ).toBeInTheDocument()
  })
})
