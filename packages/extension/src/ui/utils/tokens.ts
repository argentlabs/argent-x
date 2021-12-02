import { BigNumber } from "@ethersproject/bignumber"
import { ethers } from "ethers"
import mitt from "mitt"
import { Abi, Contract, Provider, encode, shortString, uint256 } from "starknet"

import parsedErc20Abi from "../../abi/ERC20.json"
import erc20Tokens from "../../assets/erc20-tokens.json"
import { isValidAddress } from "./addresses"

export const playgroundToken = (networkId: string) =>
  erc20Tokens.find(
    ({ name, network }) => name === "Playground Token" && network === networkId,
  )

const defaultErc20s = Object.fromEntries(
  erc20Tokens.map((token) => [token.address, token]),
)

export const tokensMitt =
  mitt<{ UPDATE: { wallet: string; tokens: string[] } }>()

tokensMitt.on("UPDATE", ({ wallet, tokens }) => {
  localStorage.setItem(`tokens:${wallet}`, JSON.stringify(tokens))
})

const getStoredTokens = (wallet: string): string[] => {
  try {
    const storedTokens = localStorage.getItem(`tokens:${wallet}`)

    if (storedTokens) {
      return JSON.parse(storedTokens)
    }
  } catch {}
  return []
}

export const getTokens = (wallet: string, networkId: string): string[] =>
  Array.from(
    new Set([
      ...Object.values(defaultErc20s)
        .filter((token) => token.network === networkId)
        .map((token) => token.address),
      ...getStoredTokens(wallet), // as stored tokens get stored by wallet there is no need to check network
    ]),
  )

export const addToken = (
  wallet: string,
  token: {
    address: string
    symbol: string
    name: string
    decimals: string
    networkId: string
  },
) => {
  if (!isValidAddress(token.address)) throw Error("token address malformed")

  localStorage.setItem(
    `wallet:${wallet}:token:${token.address}`,
    JSON.stringify(token),
  )

  const tokens = getTokens(wallet, token.networkId)
  tokensMitt.emit("UPDATE", { wallet, tokens: [...tokens, token.address] })
}

export interface TokenDetails {
  address: string
  name?: string
  symbol?: string
  decimals?: BigNumber
  balance?: BigNumber
  networkId: string
}

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
}: TokenDetails): TokenView => ({
  name: name || "Unknown token",
  symbol: symbol || "",
  decimals: decimals?.toNumber() || 0,
  balance: ethers.utils.formatUnits(balance ?? 0, decimals) || "0",
  ...rest,
})

export const fetchTokenDetails = async (
  address: string,
  walletAddress: string,
  networkId: string,
): Promise<TokenDetails> => {
  const provider = new Provider({ network: networkId as any })
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
      .catch(() => BigNumber.from(0)),
    tokenContract
      .call("symbol")
      .then((x) =>
        shortString.decodeShortString(encode.addHexPrefix(x.symbol as string)),
      )
      .catch(() => ""),
  ])
  const localStorageBackup: TokenDetails = JSON.parse(
    localStorage.getItem(`wallet:${walletAddress}:token:${address}`) || "{}",
  )
  const defaultBackup = defaultErc20s[address] || {}
  const decimalsBigNumber = BigNumber.from(
    decimals || localStorageBackup.decimals || defaultBackup.decimals || 0,
  )
  return {
    address,
    name: name || localStorageBackup.name || defaultBackup.name,
    symbol: symbol || localStorageBackup.symbol || defaultBackup.symbol,
    balance,
    networkId,
    decimals: decimalsBigNumber.isZero() ? undefined : decimalsBigNumber,
  }
}
