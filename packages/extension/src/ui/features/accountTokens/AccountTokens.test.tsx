import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { BrowserRouter } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"

import { getMockAccount } from "../../../../test/account.mock"
import { AccountTokens, AccountTokensProps } from "./AccountTokens"

const mockProps = {
  account: getMockAccount({}),
  status: { text: "active", code: "CONNECTED" },
  onRedeploy: vi.fn(),
  showAvnuBanner: false,
  showEkuboBanner: true,
  setAvnuBannerSeen: vi.fn(),
  setEkuboBannerSeen: vi.fn(),
  showTokensAndBanners: true,
  setDappLandBannerSeen: vi.fn(),
  hasEscape: true,
  accountGuardianIsSelf: true,
  showUpgradeBanner: true,
  showNoBalanceForUpgrade: true,
  showAddFundsBackdrop: true,
  tokenListVariant: "default",
  showSaveRecoverySeedphraseBanner: true,
  isDeprecated: false,
} as AccountTokensProps

describe("AccountTokens", () => {
  it('renders the component with the "empty" component when showTokensAndBanners is false', async () => {
    const props = {
      ...mockProps,
      showTokensAndBanners: false,
    }

    render(
      <BrowserRouter>
        <AccountTokens {...props} />
      </BrowserRouter>,
    )

    expect(
      await screen.findByText("You can no longer use this account"),
    ).toBeInTheDocument()
  })
  it("calls the setEkuboBannerSeen function when the ekubo banner is closed", async () => {
    const props = {
      ...mockProps,
      showTokensAndBanners: true,
    }

    render(
      <BrowserRouter>
        <AccountTokens {...props} />
      </BrowserRouter>,
    )

    const closeButton = await screen.findByTestId("close-banner")
    await userEvent.click(closeButton)

    expect(props.setEkuboBannerSeen).toHaveBeenCalled()
  })
  it("renders the component with the account deprecated banner, when isDeprecated is true", async () => {
    const props = {
      ...mockProps,
      isDeprecated: true,
    }

    render(
      <BrowserRouter>
        <AccountTokens {...props} />
      </BrowserRouter>,
    )

    expect(await screen.findByText("Account deprecated")).toBeInTheDocument()
  })
})
