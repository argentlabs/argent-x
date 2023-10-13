import { validateAndParseAddress } from "starknet"
import { num } from "starknet"
import invariant from "tiny-invariant"

import { SupportedNetworks } from "../constants"
import { Currency, ETHER } from "./currency"

/**
 * Represents an ERC20 token with a unique address and some metadata.
 */
export class Token extends Currency {
  public readonly networkId: SupportedNetworks
  public readonly address: string

  public constructor(
    networkId: SupportedNetworks,
    address: string,
    decimals: number,
    symbol?: string,
    name?: string,
  ) {
    super(decimals, symbol, name)
    this.networkId = networkId
    this.address = validateAndParseAddress(address).toLowerCase()
  }

  /**
   * Returns true if the two tokens are equivalent, i.e. have the same chainId and address.
   * @param other other token to compare
   */
  public equals(other: Token): boolean {
    // short circuit on reference equality
    if (this === other) {
      return true
    }
    return this.networkId === other.networkId && this.address === other.address
  }

  /**
   * Returns true if the address of this token sorts before the address of the other token
   * @param other other token to compare
   * @throws if the tokens have the same address
   * @throws if the tokens are on different chains
   */
  public sortsBefore(other: Token): boolean {
    invariant(this.networkId === other.networkId, "CHAIN_IDS")
    invariant(this.address !== other.address, "ADDRESSES")
    const thisAddress = num.toBigInt(this.address)
    const otherAddress = num.toBigInt(other.address)

    return thisAddress < otherAddress
  }
}

/**
 * Compares two currencies for equality
 */
export function currencyEquals(
  currencyA: Currency,
  currencyB: Currency,
): boolean {
  if (currencyA instanceof Token && currencyB instanceof Token) {
    return currencyA.equals(currencyB)
  } else if (currencyA instanceof Token) {
    return false
  } else if (currencyB instanceof Token) {
    return false
  } else {
    return currencyA === currencyB
  }
}

export const WETH: { [network in SupportedNetworks]: Token } = {
  [SupportedNetworks.MAINNET]: new Token(
    SupportedNetworks.MAINNET,
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    ETHER.decimals,
    ETHER.symbol,
    ETHER.name,
  ),
  [SupportedNetworks.TESTNET]: new Token(
    SupportedNetworks.TESTNET,
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    ETHER.decimals,
    ETHER.symbol,
    ETHER.name,
  ),
  [SupportedNetworks.TESTNET2]: new Token(
    SupportedNetworks.TESTNET,
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    ETHER.decimals,
    ETHER.symbol,
    ETHER.name,
  ),
}
