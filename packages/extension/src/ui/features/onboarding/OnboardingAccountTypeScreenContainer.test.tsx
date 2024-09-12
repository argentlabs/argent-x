import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import * as router from "react-router-dom"
import { MemoryRouter } from "react-router-dom"
import { getMockWalletAccount } from "../../../../test/walletAccount.mock"
import * as routesFile from "../../../shared/ui/routes"
import * as routes1 from "../../../shared/ui/routes"
import { AccountType, AccountTypeId } from "../accounts/AddNewAccountScreen"
import * as useAccountTypesForOnboarding from "../accounts/useAccountTypesForNetwork"
import { OnboardingAccountTypeContainer } from "./OnboardingAccountTypeScreenContainer"
import { OnboardingFinishScreenContainer } from "./OnboardingFinishScreenContainer"
import OnboardingSmartAccountEmailScreen from "./OnboardingSmartAccountEmailScreen"
import { defaultNetwork } from "../../../shared/network"
import { SignerType } from "../../../shared/wallet.model"

const accountTypes: AccountType[] = [
  {
    id: AccountTypeId.STANDARD,
    type: "standard",
    title: "Standard Account",
  },
  {
    id: AccountTypeId.SMART_ACCOUNT,
    type: "smart",
    title: "Smart Account",
  },
]

const mockWalletAccount = getMockWalletAccount()

const mockCreateAccountAction = vi.fn(() => Promise.resolve(mockWalletAccount))

vi.mock("../../hooks/useAction", () => ({
  useAction: vi.fn(() => ({
    action: mockCreateAccountAction,
    loading: false,
  })),
}))

vi.mock("../../services/account", () => ({
  clientAccountService: {
    create: vi.fn(() => Promise.resolve(mockWalletAccount)),
    select: vi.fn(() => Promise.resolve()),
  },
}))

vi.mock("../../services/argentAccount", () => ({
  clientArgentAccountService: {
    isTokenExpired: vi.fn(() => true),
    requestEmail: vi.fn(),
  },
}))

vi.mock("../../../shared/smartAccount/jwt", () => ({
  resetDevice: vi.fn(),
}))

vi.spyOn(
  useAccountTypesForOnboarding,
  "useAccountTypesForOnboarding",
).mockReturnValue(accountTypes)

vi.mock("../browser/tabs", () => ({
  useExtensionIsInTab: vi.fn(() => false),
}))

vi.mock("./hooks/useOnboardingToastMessage", () => ({
  useOnboardingToastMessage: vi.fn(),
}))

describe("OnboardingAccountTypeScreenContainer", () => {
  it("Should navigate to the email screen on create smart account", async () => {
    act(() => {
      render(
        <MemoryRouter>
          <OnboardingAccountTypeContainer />
          <router.Routes>
            <router.Route
              path={routes1.routes.onboardingSmartAccountEmail.path}
              element={<OnboardingSmartAccountEmailScreen />}
            />
          </router.Routes>
        </MemoryRouter>,
      )
    })
    expect(screen.getByText("Standard Account")).toBeInTheDocument()
    expect(screen.getByText("Smart Account")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument()

    fireEvent.click(screen.getByText("Smart Account"))
    fireEvent.click(screen.getByRole("button", { name: "Continue" }))

    expect(screen.getByText("Enter your email")).toBeInTheDocument()
    expect(screen.getByTestId("email-input")).toBeInTheDocument()
  })

  it("Should create standard account and finish onboarding", async () => {
    act(() => {
      render(
        <MemoryRouter>
          <OnboardingAccountTypeContainer />
          <router.Routes>
            <router.Route
              path={routes1.routes.onboardingFinish.path}
              element={<OnboardingFinishScreenContainer />}
            />
          </router.Routes>
        </MemoryRouter>,
      )
    })
    expect(screen.getByText("Standard Account")).toBeInTheDocument()
    expect(screen.getByText("Smart Account")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument()

    fireEvent.click(screen.getByText("Standard Account"))
    fireEvent.click(screen.getByRole("button", { name: "Continue" }))

    // Wait for the async function to complete and the UI to update
    await waitFor(() => screen.getByText("Your wallet is ready!"))

    expect(mockCreateAccountAction).toHaveBeenCalledWith(
      "standard",
      SignerType.LOCAL_SECRET,
      defaultNetwork.id,
    )
    expect(screen.getByText("Your wallet is ready!")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Finish" })).toBeInTheDocument()
  })
})
