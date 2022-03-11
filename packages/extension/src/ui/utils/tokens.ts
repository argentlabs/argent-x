import { BigNumber } from "@ethersproject/bignumber"
import { ethers } from "ethers"
import { Abi, Contract, number, shortString, uint256 } from "starknet"

import parsedErc20Abi from "../../abi/ERC20.json"
import defaultTokens from "../../assets/default-tokens.json"
import { getProvider } from "../../shared/networks"
import { TokenDetails, TokenDetailsWithBalance } from "../states/tokens"

export const testDappToken = (networkId: string) =>
  defaultTokens.find(
    ({ name, network }) => name === "Test Token" && network === networkId,
  )

export interface TokenView {
  address: string
  name: string
  symbol: string
  decimals: number
  balance: string
}

export const toTokenView = ({
  name,
  symbol,
  decimals,
  balance,
  ...rest
}: TokenDetailsWithBalance): TokenView => {
  const decimalsNumber = decimals?.toNumber() || 18
  return {
    name: name || "Unknown token",
    symbol: symbol || "",
    decimals: decimalsNumber,
    balance: ethers.utils.formatUnits(balance ?? 0, decimalsNumber) || "0",
    ...rest,
  }
}

export const fetchTokenDetails = async (
  address: string,
  networkId: string,
): Promise<TokenDetails> => {
  const provider = getProvider(networkId)
  const tokenContract = new Contract(parsedErc20Abi as Abi, address, provider)
  const [decimals, name, symbol] = await Promise.all([
    tokenContract
      .call("decimals")
      .then((x) => number.toHex(x.decimals))
      .catch(() => ""),
    tokenContract
      .call("name")
      .then((x) => shortString.decodeShortString(number.toHex(x.name)))
      .catch(() => ""),
    tokenContract
      .call("symbol")
      .then((x) => shortString.decodeShortString(number.toHex(x.symbol)))
      .catch(() => ""),
  ])
  const decimalsBigNumber = BigNumber.from(decimals || 0)
  return {
    address,
    name,
    symbol,
    networkId,
    decimals: decimalsBigNumber.isZero() ? undefined : decimalsBigNumber,
  }
}

export const fetchTokenBalance = async (
  address: string,
  accountAddress: string,
  networkId: string,
): Promise<BigNumber> => {
  const provider = getProvider(networkId)
  const tokenContract = new Contract(parsedErc20Abi as Abi, address, provider)
  const result = await tokenContract.balanceOf(accountAddress)
  return BigNumber.from(uint256.uint256ToBN(result.balance).toString())
}
