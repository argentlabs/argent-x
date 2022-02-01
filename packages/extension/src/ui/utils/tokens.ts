import { BigNumber } from "@ethersproject/bignumber"
import { ethers } from "ethers"
import { Abi, Contract, encode, shortString, uint256 } from "starknet"

import parsedErc20Abi from "../../abi/ERC20.json"
import erc20Tokens from "../../assets/erc20-tokens.json"
import { getProvider } from "../../shared/networks"
import { TokenDetailsWithBalance } from "../states/tokens"

export const playgroundToken = (networkId: string) =>
  erc20Tokens.find(
    ({ name, network }) => name === "Playground Token" && network === networkId,
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
  walletAddress: string,
  networkId: string,
): Promise<TokenDetailsWithBalance> => {
  const provider = getProvider(networkId)
  const tokenContract = new Contract(parsedErc20Abi as Abi[], address, provider)
  const [decimals, name, balance, symbol] = await Promise.all([
    tokenContract
      .call("decimals")
      .then((x) => x.decimals as string)
      .catch(() => ""),
    tokenContract
      .call("name")
      .then((x) =>
        shortString.decodeShortString(encode.addHexPrefix(x.name as string)),
      )
      .catch(() => ""),
    tokenContract
      .call("balanceOf", { user: walletAddress })
      .then((x) =>
        BigNumber.from(uint256.uint256ToBN(x.balance as any).toString()),
      )
      .catch(() => undefined),
    tokenContract
      .call("symbol")
      .then((x) =>
        shortString.decodeShortString(encode.addHexPrefix(x.symbol as string)),
      )
      .catch(() => ""),
  ])
  const decimalsBigNumber = BigNumber.from(decimals || 0)
  return {
    address,
    name,
    symbol,
    balance,
    networkId,
    decimals: decimalsBigNumber.isZero() ? undefined : decimalsBigNumber,
  }
}

export const fetchTokenBalance = async (
  address: string,
  walletAddress: string,
  networkId: string,
): Promise<BigNumber> => {
  const provider = getProvider(networkId)
  const tokenContract = new Contract(parsedErc20Abi as Abi[], address, provider)
  const result = await tokenContract.call("balanceOf", {
    user: walletAddress,
  })
  return BigNumber.from(uint256.uint256ToBN(result.balance as any).toString())
}
