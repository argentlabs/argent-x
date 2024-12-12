import { ChakraProvider } from "@chakra-ui/react"
import { render } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"

import type { RiskAssessment } from "../../../../shared/riskAssessment/schema"
import { getRandomAccountIdentifier } from "../../../../shared/utils/accountIdentifier"
import { SignerType } from "../../../../shared/wallet.model"
import { act, renderWithLegacyProviders } from "../../../test/utils"
import { mockNetworks } from "../../navigation/NetworkSwitcher.test"
import * as useActionScreenParent from "../hooks/useActionScreen"
import { ConnectDappScreenContainer } from "./ConnectDappScreenContainer"
import * as useRiskAssessmentParent from "./useRiskAssessment"

vi.mock("../hooks/useActionScreen", () => {
  return {
    useActionScreen: () => {
      return {
        action: {
          type: "CONNECT_DAPP",
          payload: {
            host: "http://localhost:3000",
          },
          meta: {
            hash: "0x123",
          },
        },
        approveAndClose: vi.fn(),
        reject: vi.fn(),
      }
    },
  }
})

const cautionResponse = {
  warning: {
    reason: "similar_to_existing_dapp_url",
    severity: "caution",
  },
} as RiskAssessment
const criticalResponse = {
  warning: {
    reason: "contract_is_black_listed",
    details: {
      reason: "Contract address is blacklisted",
    },
    severity: "critical",
  },
} as RiskAssessment
const happyResponse = {
  dapp: {
    name: "ftx",
    logoUrl: "https://ftx.com/favicon.ico",
  },
} as RiskAssessment
const highRiskResponse = {
  warning: {
    reason: "similar_to_existing_dapp_url",
    severity: "high",
  },
} as RiskAssessment

const useActionDefaultResponse = {
  selectedAccount: {
    type: "standard",
    address: "0x1",
    networkId: "sepolia",
    name: "account_1",
    id: getRandomAccountIdentifier(),
    network: mockNetworks[1],
    signer: {
      type: SignerType.LOCAL_SECRET,
      derivationPath: "123",
    },
  },
  approveAndClose: vi.fn(),
  approve: vi.fn(),
  rejectAllActions: vi.fn(),
  rejectWithoutClose: vi.fn(),
  closePopupIfLastAction: vi.fn(),
  reject: vi.fn(),
} as unknown as ReturnType<typeof useActionScreenParent.useActionScreen>
describe("ConnectDappScreenContainer", () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  it("should render dapp information for safe dapps", async () => {
    vi.spyOn(useActionScreenParent, "useActionScreen").mockReturnValue({
      ...useActionDefaultResponse,
      action: {
        type: "CONNECT_DAPP",
        payload: { host: "https://happy.dapp" },
        meta: {
          expires: 1230,

          hash: "0x123",
        },
      },
    })
    const screen = await act(() => {
      return renderWithLegacyProviders(<ConnectDappScreenContainer />)
    })
    expect(screen.getByText(/^Connect to/)).toBeInTheDocument()
    expect(screen.getByText("happy.dapp")).toBeInTheDocument()
    vi.spyOn(useRiskAssessmentParent, "useRiskAssessment").mockReturnValue(
      happyResponse,
    )
    expect(
      screen.queryByText(/^Please review warnings before continuing/),
    ).toBeNull()
  })
  it("should render dapp information with warning for critical dapps", async () => {
    vi.spyOn(useActionScreenParent, "useActionScreen").mockReturnValue({
      ...useActionDefaultResponse,
      action: {
        type: "CONNECT_DAPP",
        payload: { host: "https://unhappy.dapp" },
        meta: {
          expires: 1230,

          hash: "0x123",
        },
      },
    })
    vi.spyOn(useRiskAssessmentParent, "useRiskAssessment").mockReturnValue(
      criticalResponse,
    )
    const screen = await act(() => {
      return render(
        <ChakraProvider>
          <MemoryRouter initialEntries={["/"]}>
            <ConnectDappScreenContainer />
          </MemoryRouter>
        </ChakraProvider>,
      )
    })
    expect(screen.getByText(/^Connect to/)).toBeInTheDocument()
    expect(screen.getByText("unhappy.dapp")).toBeInTheDocument()
    expect(
      screen.queryByText(/^Please review warnings before continuing/),
    ).toBeInTheDocument()
    expect(screen.getByText("Connect")).toBeDisabled()
    const reviewButton = screen.getByText("Review")
    expect(reviewButton).toBeInTheDocument()
    expect(screen.getByText("Critical risk")).toBeInTheDocument()
  })
  it("should render dapp information with warning for high risk dapps", async () => {
    vi.spyOn(useActionScreenParent, "useActionScreen").mockReturnValue({
      ...useActionDefaultResponse,
      action: {
        type: "CONNECT_DAPP",
        payload: { host: "https://high-risk.dapp" },
        meta: {
          expires: 1230,

          hash: "0x123",
        },
      },
    })
    vi.spyOn(useRiskAssessmentParent, "useRiskAssessment").mockReturnValue(
      highRiskResponse,
    )
    const screen = await act(() => {
      return render(
        <ChakraProvider>
          <MemoryRouter initialEntries={["/"]}>
            <ConnectDappScreenContainer />
          </MemoryRouter>
        </ChakraProvider>,
      )
    })
    expect(screen.getByText(/^Connect to/)).toBeInTheDocument()
    expect(screen.getByText("high-risk.dapp")).toBeInTheDocument()
    expect(
      screen.queryByText(/^Please review warnings before continuing/),
    ).toBeInTheDocument()
    expect(screen.getByText("Connect")).toBeDisabled()
    const reviewButton = screen.getByText("Review")
    expect(reviewButton).toBeInTheDocument()
    expect(screen.getByText("High risk")).toBeInTheDocument()
  })
  it("should render dapp information with warning for dapps with caution", async () => {
    vi.spyOn(useActionScreenParent, "useActionScreen").mockReturnValue({
      ...useActionDefaultResponse,
      action: {
        type: "CONNECT_DAPP",
        payload: { host: "https://caution-risk.dapp" },
        meta: {
          expires: 1230,

          hash: "0x123",
        },
      },
    })
    vi.spyOn(useRiskAssessmentParent, "useRiskAssessment").mockReturnValue(
      cautionResponse,
    )
    const screen = await act(() => {
      return render(
        <ChakraProvider>
          <MemoryRouter initialEntries={["/"]}>
            <ConnectDappScreenContainer />
          </MemoryRouter>
        </ChakraProvider>,
      )
    })
    expect(screen.getByText(/^Connect to/)).toBeInTheDocument()
    expect(screen.getByText("caution-risk.dapp")).toBeInTheDocument()
    expect(
      screen.queryByText(/^Please review warnings before continuing/),
    ).not.toBeInTheDocument()
    expect(screen.getByText("Connect")).not.toBeDisabled()
    const reviewButton = screen.getByText("Review")
    expect(reviewButton).toBeInTheDocument()
    expect(screen.getByText("Caution")).toBeInTheDocument()
  })
})
