import { validateOutsideExecution } from "./utils"
import { stark, typedData } from "starknet"
import * as whitelist from "./whitelist"
import { getMockNetwork } from "../../../../../../test/network.mock"
import { addressSchema } from "@argent/shared"

vi.mock("./whitelist")

describe("validateOutsideExecution", () => {
  const callerAddress = stark.randomAddress()
  const toAddress = stark.randomAddress()
  const mockDataToSign: typedData.TypedData = {
    domain: {
      name: "Account.execute_from_outside",
      chainId: "0x534e5f474f45524c49", // SN_GOERLI
    },
    message: {
      caller: callerAddress,
      nonce: 15,
      execute_before: "0xfee3", // 40707
      execute_after: "0xfee9", // 40713
      calls: [
        {
          to: toAddress,
          selector: "0x000000",
          calldata_len: 1,
          calldata: ["0x0000000"],
        },
      ],
    },
    types: {},
    primaryType: "OutsideExecution",
  }

  const mockNetwork = getMockNetwork({ chainId: "SN_GOERLI" })

  it("should return false if network is not provided", () => {
    expect(validateOutsideExecution(mockDataToSign)).toEqual(false)
  })

  it("should return false if domain chainId is not the same as network chainId", () => {
    const dataToSign = {
      ...mockDataToSign,
      domain: {
        ...mockDataToSign.domain,
        chainId: "0x534e5f4d41494e", // SN_MAIN
      },
    }
    expect(validateOutsideExecution(dataToSign, mockNetwork)).toEqual(false)
  })

  it("should return true if outside execution message is valid without whitelist for Non-mainnet network", () => {
    expect(validateOutsideExecution(mockDataToSign, mockNetwork)).toEqual(true)
  })

  it("should return true if outside execution message is whitelisted and valid", () => {
    const whitelistedCallerAddress = addressSchema.parse(callerAddress)
    vi.spyOn(whitelist, "getWhitelistedContracts").mockReturnValue([
      whitelistedCallerAddress,
    ])
    const dataToSign: typedData.TypedData = {
      ...mockDataToSign,
      domain: {
        ...mockDataToSign.domain,
        chainId: "0x534e5f4d41494e", // SN_MAIN
      },
    }
    const mockMainnetNetwork = getMockNetwork({ chainId: "SN_MAIN" })
    expect(validateOutsideExecution(dataToSign, mockMainnetNetwork)).toEqual(
      true,
    )
  })
})
