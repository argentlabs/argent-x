import {
  checkIfUpgradeAvailable,
  checkIfDeprecated,
  partitionDeprecatedAccount,
} from "./accountUpgradeCheck"
import { WalletAccount } from "../../../shared/wallet.model"
import { Network } from "../../../shared/network"
import { getMockWalletAccount } from "../../../../test/walletAccount.mock"
import {
  ETH_TOKEN_ADDRESS,
  STANDARD_CAIRO_0_ACCOUNT_CLASS_HASH,
} from "../../../shared/network/constants"
import { getMockNetwork } from "../../../../test/network.mock"

describe("accountUpgradeCheck", () => {
  let account: WalletAccount
  let network: Network

  beforeEach(() => {
    account = getMockWalletAccount({
      name: "SomeName",
      classHash: "0x1234",
      address: "SomeAddress",
      showBlockingDeprecated: false,
      // ...other properties if needed
    })

    network = getMockNetwork({
      id: "localhost",
      name: "localhostNetwork",
      chainId: "SN_GOERLI",
      accountClassHash: {
        standard: "0x1234",
        multisig: "0x5678",
        standardCairo0: STANDARD_CAIRO_0_ACCOUNT_CLASS_HASH,
        // ... other properties if needed
      },
      possibleFeeTokenAddresses: [ETH_TOKEN_ADDRESS],
    })
  })

  describe("checkIfUpgradeAvailable", () => {
    it("returns false when targetClassHash is undefined", () => {
      expect(checkIfUpgradeAvailable(account)).toBe(false)
    })

    it("returns false when account.classHash is undefined", () => {
      account.classHash = undefined
      expect(checkIfUpgradeAvailable(account, network.accountClassHash)).toBe(
        false,
      )
    })

    it("should return true when currentImplementation does not match any targetImplementations", () => {
      const differentNetwork: Network = {
        ...network,
        id: "differentNetwork",
        accountClassHash: { standard: "0x619" },
      }
      expect(
        checkIfUpgradeAvailable(account, differentNetwork.accountClassHash),
      ).toBe(true)
    })

    it("should return false when currentImplementation matches a targetImplementation", () => {
      expect(checkIfUpgradeAvailable(account, network.accountClassHash)).toBe(
        false,
      )
    })
  })

  describe("checkIfDeprecated", () => {
    it("returns true when showBlockingDeprecated is true", () => {
      account.showBlockingDeprecated = true
      expect(checkIfDeprecated(account)).toBe(true)
    })

    it("returns false when showBlockingDeprecated is false", () => {
      expect(checkIfDeprecated(account)).toBe(false)
    })
  })

  describe("partitionDeprecatedAccount", () => {
    let accounts: WalletAccount[]

    beforeEach(() => {
      accounts = [account, { ...account, address: "AnotherAddress" }]
    })

    it("returns second set full if network.accountClassHash is undefined", () => {
      const differentNetwork = { ...network, accountClassHash: undefined }
      expect(partitionDeprecatedAccount(accounts, differentNetwork)).toEqual([
        [],
        ["SomeAddress", "AnotherAddress"],
      ])
    })

    it("partitions accounts correctly", () => {
      const differentNetwork2: Network = {
        ...network,
        accountClassHash: { standard: "0x143" },
      }

      const differentAccount: WalletAccount = {
        ...account,
        classHash: "0x1111",
        address: "AnotherAddress",
        network: differentNetwork2,
        networkId: differentNetwork2.id,
      }

      account = {
        ...account,
        classHash: "0x143",
        network: differentNetwork2,
        networkId: differentNetwork2.id,
      }

      const differentAccounts = [account, differentAccount]

      expect(
        partitionDeprecatedAccount(differentAccounts, differentNetwork2),
      ).toEqual([["SomeAddress"], ["AnotherAddress"]])
    })

    it("partitions accounts correctly for multisig accounts", () => {
      const differentNetwork: Network = {
        ...network,
        accountClassHash: {
          standard:
            "0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003",
          multisig:
            "0x0737ee2f87ce571a58c6c8da558ec18a07ceb64a6172d5ec46171fbc80077a48",
        },
      }

      const multisigAccount: WalletAccount = {
        ...account,
        classHash:
          "0x0737ee2f87ce571a58c6c8da558ec18a07ceb64a6172d5ec46171fbc80077a48",
        address: "Multisig 1",
        network: differentNetwork,
        networkId: differentNetwork.id,
      }

      account = {
        ...account,
        classHash:
          "0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003",
        network: differentNetwork,
        networkId: differentNetwork.id,
      }

      const differentAccounts = [account, multisigAccount]

      expect(
        partitionDeprecatedAccount(differentAccounts, differentNetwork),
      ).toEqual([["SomeAddress", "Multisig 1"], []])
    })
  })
})
