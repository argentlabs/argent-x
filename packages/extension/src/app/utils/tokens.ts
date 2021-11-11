import { BigNumber } from "@ethersproject/bignumber"
import mitt from "mitt"
import { Abi, Contract } from "starknet"

import parsedErc20Abi from "../../abi/ERC20.json"

export const tokensMitt =
  mitt<{ UPDATE: { wallet: string; tokens: string[] } }>()

tokensMitt.on("UPDATE", ({ wallet, tokens }) => {
  localStorage.setItem(`tokens:${wallet}`, JSON.stringify(tokens))
})

export const getTokens = (wallet: string): string[] => {
  try {
    const storedTokens = localStorage.getItem(`tokens:${wallet}`)

    if (storedTokens) {
      return JSON.parse(storedTokens)
    }

    return []
  } catch {
    return []
  }
}

export const isValidAddress = (address: string): boolean =>
  /^0x[0-9a-f]{63}$/.test(address)

export const addToken = (
  wallet: string,
  token: { address: string; symbol: string; name: string; decimals: string },
) => {
  if (!isValidAddress(token.address)) throw Error("token address malformed")

  localStorage.setItem(
    `wallet:${wallet}token:${token.address}`,
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

export const fetchTokenDetails = async (
  address: string,
  walletAddress: string,
): Promise<TokenDetails> => {
  const tokenContract = new Contract(parsedErc20Abi as Abi[], address)
  const [decimals, name, balance, symbol] = await Promise.all([
    tokenContract
      .call("decimals")
      .then((x) => x.res)
      .catch(() => ""),
    tokenContract
      .call("name")
      .then((x) => x.res)
      .catch(() => ""),
    tokenContract
      .call("balance_of", { user: walletAddress })
      .then((x) => x.res)
      .catch(() => ""),
    tokenContract
      .call("symbol")
      .then((x) => x.res)
      .catch(() => ""),
  ])
  const localStorageBackup: TokenDetails = JSON.parse(
    localStorage.getItem(`wallet:${walletAddress}token:${address}`) || "{}",
  )
  return {
    address,
    name: name ? (name as string) : localStorageBackup.name ?? undefined,
    symbol: symbol
      ? (symbol as string)
      : localStorageBackup.symbol ?? undefined,
    balance: balance ? BigNumber.from(balance) : undefined,
    decimals: decimals
      ? BigNumber.from(decimals)
      : BigNumber.from(localStorageBackup.decimals) ?? undefined,
  }
}
