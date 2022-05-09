import { BigNumber } from "@ethersproject/bignumber"
import { ethers } from "ethers"
import { Abi, Contract, number, shortString, uint256 } from "starknet"

import parsedErc20Abi from "../../../abis/ERC20.json"
import { feeToken } from "../../../shared/token"
import { Account } from "../accounts/Account"
import { TokenDetails, TokenDetailsWithBalance } from "./tokens.state"

export interface TokenView {
  address: string
  name: string
  symbol: string
  decimals: number
  balance: string

  image?: string
  showAlways?: boolean
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
  account: Account,
): Promise<TokenDetails> => {
  const tokenContract = new Contract(
    parsedErc20Abi as Abi,
    address,
    account.provider,
  )
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
    networkId: account.networkId,
    decimals: decimalsBigNumber.isZero() ? undefined : decimalsBigNumber,
  }
}

export const fetchTokenBalance = async (
  address: string,
  account: Account,
): Promise<BigNumber> => {
  const tokenContract = new Contract(
    parsedErc20Abi as Abi,
    address,
    account.provider,
  )
  const result = await tokenContract.balanceOf(account.address)
  return BigNumber.from(uint256.uint256ToBN(result.balance).toString())
}

export const fetchFeeTokenBalance = async (
  account: Account,
  networkId: string,
): Promise<BigNumber> => {
  const token = feeToken(networkId)
  if (!token) {
    return BigNumber.from(0)
  }
  return fetchTokenBalance(token.address, account)
}
