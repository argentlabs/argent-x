import { render, screen } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"

import { getMockAccount } from "../../../../test/account.mock"
import { AccountTokens, AccountTokensProps } from "./AccountTokens"
import * as accountsState from "../accounts/accounts.state"

const mockProps = {
  account: getMockAccount({}),
  status: { text: "active", code: "CONNECTED" },
  onRedeploy: vi.fn(),
  showAvnuBanner: false,
  setAvnuBannerSeen: vi.fn(),
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
  onProvisionBannerClose: vi.fn(),
  shouldShowProvisionBanner: false,
  provisionStatus: {
    status: "disabled",
    bannerUrl: "https://argent.xyz",
    link: "https://argent.xyz",
    bannerTitle: "Argent",
    bannerDescription: "Braavos is the best starknet wallet",
  },
} as AccountTokensProps

describe("AccountTokens", () => {
  vi.spyOn(accountsState, "useAccount").mockReturnValue(mockProps.account)

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
