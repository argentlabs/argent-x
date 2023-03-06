import { getMockAccount } from "../../../../test/account.mock"
import { Network } from "../../../shared/network"
import { Account } from "./Account"
import {
  setDefaultAccountNames,
  useAccountMetadata,
} from "./accountMetadata.state"

const mockAccounts = [
  { ...getMockAccount({ address: "0x123", type: "standard" }) },
  { ...getMockAccount({ address: "0x456", type: "multisig" }) },
  { ...getMockAccount({ address: "0x789", type: "standard" }) },
  {
    ...getMockAccount({
      address: "0xabc",
      type: "standard",
      network: { name: "goerli", id: "goerli" } as Network,
    }),
  },
  {
    ...getMockAccount({
      address: "0xdef",
      type: "multisig",
      network: { name: "goerli", id: "goerli" } as Network,
    }),
  },
] as Account[]

const mockAccountNames = {
  localhost: {
    "0x123": "Account 1",
    "0x456": "Multisig 1",
    "0x789": "Account 2",
  },
  goerli: {
    "0xabc": "Account 3",
    "0xdef": "Multisig 2",
  },
}

describe("setDefaultAccountNames", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })
  it("sets default account names for argent and multisig accounts", () => {
    const spy = vi.spyOn(useAccountMetadata, "setState")
    setDefaultAccountNames(mockAccounts)
    expect(spy).toHaveBeenCalledWith({
      accountNames: mockAccountNames,
    })
  })

  it("sets default account names to empty object when given an empty array", () => {
    const spy = vi.spyOn(useAccountMetadata, "setState")
    setDefaultAccountNames([])
    expect(spy).toHaveBeenCalledWith({
      accountNames: {},
    })
  })
})
