import { getMockAccount } from "../../../../test/account.mock"
import { getMockWalletAccount } from "../../../../test/walletAccount.mock"
import { accountRepo } from "../../../shared/account/store"
import { Network } from "../../../shared/network"
import { WalletAccount } from "../../../shared/wallet.model"
import { Account } from "./Account"
import {
  migrate,
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

describe("Test migration", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })
  it("should update the names in the wallet accounts", async () => {
    const mockWalletAccounts = [
      getMockWalletAccount({
        address: "0x123",
        type: "standard",
        networkId: "localhost",
      }),
      getMockWalletAccount({
        address: "0x456",
        type: "multisig",
        networkId: "localhost",
      }),
      getMockWalletAccount({
        address: "0x789",
        type: "standard",
        networkId: "localhost",
      }),
    ]

    const getMock = vi
      .spyOn(accountRepo, "get")
      .mockResolvedValueOnce(mockWalletAccounts as any) // Doing this to test the migration

    const pushSpy = vi.spyOn(accountRepo, "upsert")

    await migrate(mockAccountNames)

    const expectedUpdatedWalletAccounts: WalletAccount[] = [
      {
        ...mockWalletAccounts[0],
        name: "Account 1",
      },
      {
        ...mockWalletAccounts[1],
        name: "Multisig 1",
      },
      {
        ...mockWalletAccounts[2],
        name: "Account 2",
      },
    ]

    expect(pushSpy).toHaveBeenCalledWith(expectedUpdatedWalletAccounts)
    getMock.mockRestore()
    pushSpy.mockRestore()
  })
})
