import { getMockAccount } from "../../../../test/account.mock"
import { Account } from "./Account"
import {
  setDefaultAccountNames,
  useAccountMetadata,
} from "./accountMetadata.state"

const mockAccounts = [
  { ...getMockAccount, address: "0x123", type: "standard" },
  { ...getMockAccount, address: "0x456", type: "multisig" },
  { ...getMockAccount, address: "0x789", type: "standard" },
  { ...getMockAccount, address: "0xabc", type: "standard" },
  { ...getMockAccount, address: "0xdef", type: "multisig" },
] as Account[]

const mockAccountNames = {
  1: {
    "0x123": "Account 1",
    "0x456": "Multisig Account 1",
  },
  2: {
    "0x789": "Account 1",
    "0xabc": "Account 2",
  },
  3: {
    "0xdef": "Multisig Account 1",
  },
}

const mockUseAccountMetadata = () => {
  const state = { accountNames: {} }
  const setState = jest.fn()
  return { state, setState }
}

describe("setDefaultAccountNames", () => {
  let origUseAccountMetadata: () => void

  beforeEach(() => {
    origUseAccountMetadata = useAccountMetadata
    useAccountMetadata = mockUseAccountMetadata()
  })

  afterEach(() => {
    useAccountMetadata = origUseAccountMetadata
  })

  it("sets default account names for argent and multisig accounts", () => {
    setDefaultAccountNames(mockAccounts)
    expect(useAccountMetadata.setState).toHaveBeenCalledWith({
      accountNames: mockAccountNames,
    })
  })

  it("sets default account names to empty object when given an empty array", () => {
    setDefaultAccountNames([])
    expect(useAccountMetadata.setState).toHaveBeenCalledWith({
      accountNames: {},
    })
  })
})
