import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import * as router from "react-router-dom"
import { MemoryRouter } from "react-router-dom"
import { defaultNetwork } from "../../../shared/network"
import * as useRouteFile from "../../hooks/useRoute"
import { routes } from "../../../shared/ui/routes"
import { renderWithLegacyProviders } from "../../test/utils"
import { CreateSmartAccountEmailScreen } from "../smartAccount/CreateSmartAccountEmailScreen"
import { CreateSmartAccountOTPScreen } from "../smartAccount/CreateSmartAccountOTPScreen"
import * as useSmartAccountVerifiedEmail from "../smartAccount/useSmartAccountVerifiedEmail"
import type { AccountType } from "./AddNewAccountScreen"
import { AccountTypeId, AddNewAccountScreen } from "./AddNewAccountScreen"
import { AddNewAccountScreenContainer } from "./AddNewAccountScreenContainer"
import * as useAccountTypesForNetwork from "./useAccountTypesForNetwork"

const accountTypes: AccountType[] = [
  {
    id: AccountTypeId.STANDARD,
    type: "standard",
    title: "Standard Account",
  },
  {
    id: AccountTypeId.MULTISIG,
    type: "multisig",
    title: "Multisig Account",
    subtitle: "For multiple owners",
  },
  {
    id: AccountTypeId.SMART_ACCOUNT,
    type: "smart",
    title: "Smart Account",
  },
]

const mockAction = vi.fn()
vi.mock("../../hooks/useAction", () => ({
  useAction: vi.fn(() => ({ action: mockAction, loading: false })),
}))

vi.mock("../networks/hooks/useCurrentNetwork", () => ({
  useCurrentNetwork: vi.fn(() => defaultNetwork),
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

vi.mock("../browser/tabs", () => ({
  useExtensionIsInTab: vi.fn(() => false),
}))

describe("AddNewAccountScreen", () => {
  it("Should call create standard account", async () => {
    const isAccountTypeLoading = vi.fn(() => false)
    const onAccountTypeConfirm = vi.fn()
    const onClose = vi.fn()

    act(() => {
      renderWithLegacyProviders(
        <AddNewAccountScreen
          accountTypes={accountTypes}
          isAccountTypeLoading={isAccountTypeLoading}
          onAccountTypeConfirmed={onAccountTypeConfirm}
          onClose={onClose}
        />,
      )
    })
    expect(screen.getByText("Standard Account")).toBeInTheDocument()
    expect(screen.getByText("Multisig Account")).toBeInTheDocument()
    expect(screen.getByText("Smart Account")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument()

    fireEvent.click(screen.getByText("Standard Account"))
    screen.getByRole("button", { name: "Continue" }).click()
    expect(onAccountTypeConfirm).toHaveBeenCalledWith(AccountTypeId.STANDARD)
    expect(isAccountTypeLoading).toHaveBeenCalledTimes(1)
  })

  it("Should call create smart account", async () => {
    const isAccountTypeLoading = vi.fn(() => false)
    const onAccountTypeConfirm = vi.fn()
    const onClose = vi.fn()

    act(() => {
      renderWithLegacyProviders(
        <AddNewAccountScreen
          accountTypes={accountTypes}
          isAccountTypeLoading={isAccountTypeLoading}
          onAccountTypeConfirmed={onAccountTypeConfirm}
          onClose={onClose}
        />,
      )
    })

    expect(screen.getByText("Standard Account")).toBeInTheDocument()
    expect(screen.getByText("Multisig Account")).toBeInTheDocument()
    expect(screen.getByText("Smart Account")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument()

    fireEvent.click(screen.getByText("Smart Account"))
    screen.getByRole("button", { name: "Continue" }).click()
    expect(onAccountTypeConfirm).toHaveBeenCalledWith(
      AccountTypeId.SMART_ACCOUNT,
    )
    expect(isAccountTypeLoading).toHaveBeenCalledTimes(2)
  })
})

describe("AddNewAccountScreenContainer", () => {
  vi.spyOn(
    useAccountTypesForNetwork,
    "useAccountTypesForNetwork",
  ).mockReturnValue(accountTypes)
  it("Should navigate to the email screen on create smart account", async () => {
    vi.spyOn(
      useSmartAccountVerifiedEmail,
      "useSmartAccountVerifiedEmail",
    ).mockReturnValue(undefined)

    act(() => {
      render(
        <MemoryRouter
          initialEntries={[
            routes.createSmartAccountEmail("createSmartAccount"),
          ]}
        >
          <AddNewAccountScreenContainer />
          <router.Routes>
            <router.Route
              path={routes.createSmartAccountEmail.path}
              element={<CreateSmartAccountEmailScreen />}
            />
          </router.Routes>
        </MemoryRouter>,
      )
    })

    expect(await screen.findByText("Standard Account")).toBeInTheDocument()
    expect(screen.getByText("Multisig Account")).toBeInTheDocument()
    expect(screen.getByText("Smart Account")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument()

    fireEvent.click(screen.getByText("Smart Account"))
    fireEvent.click(screen.getByRole("button", { name: "Continue" }))

    expect(screen.getByText("Enter email")).toBeInTheDocument()
    expect(screen.getByTestId("email-input")).toBeInTheDocument()
  })

  it("Should navigate to the OTP screen on create smart account", async () => {
    const verifiedEmail = "test@email.com"
    vi.spyOn(
      useSmartAccountVerifiedEmail,
      "useSmartAccountVerifiedEmail",
    ).mockReturnValue(verifiedEmail)

    vi.spyOn(useRouteFile, "useRouteFlow").mockReturnValue("createSmartAccount")

    vi.spyOn(useRouteFile, "useRouteEmailAddress").mockReturnValue(
      verifiedEmail,
    )

    act(() => {
      render(
        <MemoryRouter
          initialEntries={[
            routes.createSmartAccountOTP(verifiedEmail, "createSmartAccount"),
          ]}
        >
          <AddNewAccountScreenContainer />
          <router.Routes>
            <router.Route
              path={routes.createSmartAccountOTP.path}
              element={<CreateSmartAccountOTPScreen />}
            />
          </router.Routes>
        </MemoryRouter>,
      )
    })
    expect(screen.getByText("Standard Account")).toBeInTheDocument()
    expect(screen.getByText("Multisig Account")).toBeInTheDocument()
    expect(screen.getByText("Smart Account")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument()

    fireEvent.click(screen.getByText("Smart Account"))
    fireEvent.click(screen.getByRole("button", { name: "Continue" }))

    expect(screen.getByText("Check your email")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Resend code" }),
    ).toBeInTheDocument()
  })

  it("Should call create account on create smart account", async () => {
    const verifiedEmail = "test@email.com"
    vi.spyOn(
      useSmartAccountVerifiedEmail,
      "useSmartAccountVerifiedEmail",
    ).mockReturnValue(verifiedEmail)

    vi.spyOn(useRouteFile, "useRouteFlow").mockReturnValue("createSmartAccount")

    vi.spyOn(useRouteFile, "useRouteEmailAddress").mockReturnValue(
      verifiedEmail,
    )

    vi.mock("../../services/argentAccount", () => ({
      clientArgentAccountService: {
        isTokenExpired: vi.fn(() => false),
        requestEmail: vi.fn(),
      },
    }))

    act(() => {
      renderWithLegacyProviders(<AddNewAccountScreenContainer />)
    })
    expect(screen.getByText("Standard Account")).toBeInTheDocument()
    expect(screen.getByText("Multisig Account")).toBeInTheDocument()
    expect(screen.getByText("Smart Account")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument()

    screen.getByText("Smart Account").click()
    screen.getByRole("button", { name: "Continue" }).click()

    void waitFor(() =>
      expect(mockAction).toHaveBeenCalledWith("smart", defaultNetwork.id),
    )
  })
})
