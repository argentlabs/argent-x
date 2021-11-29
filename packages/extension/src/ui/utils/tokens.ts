import { BigNumber } from "@ethersproject/bignumber"
import { ethers } from "ethers"
import mitt from "mitt"
import { Abi, Contract } from "starknet"

import parsedErc20Abi from "../../abi/ERC20.json"
import erc20Tokens from "../../assets/erc20-tokens.json"
import { isValidAddress } from "./addresses"

export const playgroundToken = erc20Tokens.find(
  ({ address }) =>
    address ===
    "0x00a45e3942b7a75983dea7afffda9304d0273773619d1e3d5eaa757d751bfaf3",
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

export const getTokens = (wallet: string): string[] =>
  Array.from(
    new Set([...Object.keys(defaultErc20s), ...getStoredTokens(wallet)]),
  )

export const addToken = (
  wallet: string,
  token: { address: string; symbol: string; name: string; decimals: string },
) => {
  if (!isValidAddress(token.address)) throw Error("token address malformed")

  localStorage.setItem(
    `wallet:${wallet}:token:${token.address}`,
    JSON.stringify(token),
  )

  const tokens = getTokens(wallet)
  tokensMitt.emit("UPDATE", { wallet, tokens: [...tokens, token.address] })
}

export interface TokenDetails {
  address: string
  name?: string
  symbol?: string
  decimals?: BigNumber
  balance?: BigNumber
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
): Promise<TokenDetails> => {
  const tokenContract = new Contract(parsedErc20Abi as Abi[], address)
  const [decimals, name, balance, symbol] = await Promise.all([
    tokenContract
      .call("decimals")
      .then((x) => x.res as string)
      .catch(() => ""),
    tokenContract
      .call("name")
      .then((x) => x.res as string)
      .catch(() => ""),
    tokenContract
      .call("balance_of", { user: walletAddress })
      .then((x) => x.res as string)
      .catch(() => ""),
    tokenContract
      .call("symbol")
      .then((x) => x.res as string)
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
    balance: balance ? BigNumber.from(balance) : undefined,
    decimals: decimalsBigNumber.isZero() ? decimalsBigNumber : undefined,
  }
}
