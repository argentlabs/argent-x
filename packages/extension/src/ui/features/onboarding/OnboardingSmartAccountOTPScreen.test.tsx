import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import * as router from "react-router-dom"
import { MemoryRouter } from "react-router-dom"
import { getMockWalletAccount } from "../../../../test/walletAccount.mock"
import {
  ArgentAccountError,
  SMART_ACCOUNT_EMAIL_VALIDATION_FAILURE_SCENARIO_1,
} from "../../../shared/errors/argentAccount"
import { defaultNetwork } from "../../../shared/network"
import * as addBeAccount from "../../../shared/smartAccount/validation/addBackendAccount"
import * as validateAccount from "../../../shared/smartAccount/validation/validateAccount"
import * as verification from "../../../shared/smartAccount/validation/verification"
import * as useRouteFile from "../../hooks/useRoute"
import * as routes1 from "../../../shared/ui/routes"
import { renderWithLegacyProviders } from "../../test/utils"
import { OnboardingFinishScreenContainer } from "./OnboardingFinishScreenContainer"
import OnboardingSmartAccountOTPScreen from "./OnboardingSmartAccountOTPScreen"

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

vi.mock("../networks/hooks/useCurrentNetwork", () => ({
  useCurrentNetwork: vi.fn(() => defaultNetwork),
}))

vi.mock("../../../shared/smartAccount/verifiedEmail", () => ({
  updateVerifiedEmail: vi.fn(),
}))
const email = "test@argent.xyz"

vi.spyOn(useRouteFile, "useRouteEmailAddress").mockReturnValue(email)

const argentAccountServiceMocks = vi.hoisted(() => {
  return {
    clientArgentAccountService: {
      confirmEmail: vi.fn(() => Promise.resolve()),
      validateAccount: vi.fn(() => Promise.resolve()),
      addGuardianToAccount: vi.fn(() => Promise.resolve()),
      requestEmail: vi.fn(),
      isTokenExpired: vi.fn(),
    },
    accountSharedService: {
      syncAccountNamesWithBackend: vi.fn(),
    },
  }
})

vi.mock("../../services/argentAccount", () => ({
  clientArgentAccountService:
    argentAccountServiceMocks.clientArgentAccountService,
}))

vi.mock("../../../shared/account/service", () => ({
  accountSharedService: argentAccountServiceMocks.accountSharedService,
}))

describe("OnboardingSmartAccountOTPScreen", () => {
  it("Should navigate to the finish screen and create smart account", async () => {
    act(() => {
      render(
        <MemoryRouter>
          <OnboardingSmartAccountOTPScreen />
          <router.Routes>
            <router.Route
              path={routes1.routes.onboardingFinish.path}
              element={<OnboardingFinishScreenContainer />}
            />
          </router.Routes>
        </MemoryRouter>,
      )
    })

    expect(screen.getByText("Check your email")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Resend code" }),
    ).toBeInTheDocument()

    const pinInputFields = screen.getAllByLabelText(
      "Please enter your pin code",
    )

    const pin = ["1", "2", "3", "4", "5", "6"]

    act(() => {
      pinInputFields.forEach((field, index) => {
        fireEvent.change(field, { target: { value: pin[index] } })
      })
    })

    await waitFor(() => screen.getByText("Your wallet is ready!"))

    expect(screen.getByText("Your wallet is ready!")).toBeInTheDocument()
    expect(mockCreateAccountAction).toHaveBeenCalled()
  })

  it("Should navigate to the error screen ", async () => {
    vi.clearAllMocks()
    vi.spyOn(
      validateAccount,
      "getSmartAccountValidationErrorFromBackendError",
    ).mockReturnValue(SMART_ACCOUNT_EMAIL_VALIDATION_FAILURE_SCENARIO_1)

    vi.spyOn(
      verification,
      "getVerificationErrorFromBackendError",
    ).mockReturnValue(undefined)

    vi.spyOn(
      addBeAccount,
      "getAddBackendAccountErrorFromBackendError",
    ).mockReturnValue(null)

    argentAccountServiceMocks.clientArgentAccountService.validateAccount.mockRejectedValueOnce(
      new ArgentAccountError({
        code: SMART_ACCOUNT_EMAIL_VALIDATION_FAILURE_SCENARIO_1,
      }),
    )

    act(() => {
      renderWithLegacyProviders(<OnboardingSmartAccountOTPScreen />)
    })

    expect(screen.getByText("Check your email")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Resend code" }),
    ).toBeInTheDocument()
    const pinInputFields = screen.getAllByLabelText(
      "Please enter your pin code",
    )
    const pin = ["1", "2", "3", "4", "5", "6"]
    act(() => {
      pinInputFields.forEach((field, index) => {
        fireEvent.change(field, { target: { value: pin[index] } })
      })
    })
    await waitFor(() => screen.getByText("Oops, wrong email"))
    expect(screen.getByText("Oops, wrong email")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Try again" }),
    ).toBeInTheDocument()
    expect(mockCreateAccountAction).not.toHaveBeenCalled()
  })
})
