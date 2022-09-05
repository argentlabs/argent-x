import { BigNumber, BigNumberish } from "@ethersproject/bignumber"
import { utils } from "ethers"
import { chunk } from "lodash-es"
import {
  Abi,
  Contract,
  hash,
  number,
  shortString,
  stark,
  uint256,
} from "starknet"

import parsedErc20Abi from "../../../abis/ERC20.json"
import { Token } from "../../../shared/token/type"
import { getFeeToken } from "../../../shared/token/utils"
import { getMulticallContract } from "../../services/multicall.service"
import { Account } from "../accounts/Account"
import { TokenDetailsWithBalance } from "./tokens.state"

export interface TokenView {
  address: string
  name: string
  symbol: string
  decimals: number
  balance: string

  image?: string
  showAlways?: boolean
}

const formatTokenBalanceToCharLength =
  (length: number) =>
  (balance: BigNumberish = 0, decimals = 18): string => {
    const balanceBn = BigNumber.from(balance)
    const balanceFullString = utils.formatUnits(balanceBn, decimals)

    // show max ${length} characters or what's needed to show everything before the decimal point
    const balanceString = balanceFullString.slice(
      0,
      Math.max(length, balanceFullString.indexOf(".")),
    )

    // make sure seperator is not the last character, if so remove it
    // remove unnecessary 0s from the end, except for ".0"
    let cleanedBalanceString = balanceString
      .replace(/\.$/, "")
      .replace(/0+$/, "")
    if (cleanedBalanceString.endsWith(".")) {
      cleanedBalanceString += "0"
    }

    return cleanedBalanceString
  }

export const formatTokenBalance = formatTokenBalanceToCharLength(9)

export const toTokenView = ({
  name,
  symbol,
  decimals,
  balance,
  ...rest
}: TokenDetailsWithBalance): TokenView => {
  const decimalsNumber = decimals ?? 18
  return {
    name: name || "Unknown token",
    symbol: symbol || "",
    decimals: decimalsNumber,
    balance: formatTokenBalance(balance, decimalsNumber),
    ...rest,
  }
}

export const fetchTokenDetails = async (
  address: string,
  account: Account,
): Promise<Token> => {
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
  const decimalsBigNumber = BigNumber.from(decimals)
  return {
    address,
    name,
    symbol,
    networkId: account.networkId,
    decimals: decimalsBigNumber.toNumber(),
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

export type BalancesMap = Record<string, BigNumber | undefined>

export const fetchAllTokensBalance = async (
  tokenAddresses: string[],
  account: Account,
) => {
  const multicallContract = getMulticallContract(account.network)

  if (!multicallContract) {
    // if no multicall contract is found, fallback to Promises
    return fetchTokenBalancesWithoutMulticall(tokenAddresses, account)
  }

  const compiledCalldata = stark.compileCalldata({
    address: account.address,
  })

  const calls = tokenAddresses.flatMap((address) => [
    address,
    hash.getSelectorFromName("balanceOf"),
    compiledCalldata.length,
    ...compiledCalldata,
  ])

  const response = await multicallContract.aggregate(calls)

  const results: string[] = response.result.map((res: any) => number.toHex(res))

  const resultChunks = chunk(results, 2)

  return resultChunks.reduce<BalancesMap>((acc, result, i) => {
    const balance = BigNumber.from(
      uint256.uint256ToBN({ low: result[0], high: result[1] }).toString(),
    )

    return {
      ...acc,
      [tokenAddresses[i]]: balance,
    }
  }, {})
}

export const fetchTokenBalancesWithoutMulticall = async (
  tokenAddresses: string[],
  account: Account,
): Promise<BalancesMap> => {
  const balances = await Promise.all(
    tokenAddresses.map(async (address) =>
      fetchTokenBalance(address, account).catch(() => undefined),
    ),
  )

  return balances.reduce<BalancesMap>((acc, balance, i) => {
    return {
      ...acc,
      [tokenAddresses[i]]: balance,
    }
  }, {})
}

export const fetchFeeTokenBalance = async (
  account: Account,
  networkId: string,
): Promise<BigNumber> => {
  const token = getFeeToken(networkId)
  if (!token) {
    return BigNumber.from(0)
  }
  return fetchTokenBalance(token.address, account)
}
