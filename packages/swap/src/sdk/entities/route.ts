import invariant from "tiny-invariant"

import { Currency } from "./currency"
import { Price } from "./fractions/price"
import { Pair } from "./pair"
import { Token, WETH } from "./token"
import { ETHER, SupportedNetworks } from ".."

export class Route {
  public readonly pairs: Pair[]
  public readonly path: Token[]
  public readonly input: Currency
  public readonly output: Currency
  public readonly midPrice: Price

  public constructor(pairs: Pair[], input: Currency, output?: Currency) {
    invariant(pairs.length > 0, "PAIRS")
    invariant(
      pairs.every((pair) => pair.networkId === pairs[0].networkId),
      "CHAIN_IDS",
    )
    invariant(
      (input instanceof Token && pairs[0].involvesToken(input)) ||
        (input === ETHER && pairs[0].involvesToken(WETH[pairs[0].networkId])),
      "INPUT",
    )
    invariant(
      typeof output === "undefined" ||
        (output instanceof Token &&
          pairs[pairs.length - 1].involvesToken(output)) ||
        (output === ETHER &&
          pairs[pairs.length - 1].involvesToken(WETH[pairs[0].networkId])),
      "OUTPUT",
    )

    const path: Token[] = [
      input instanceof Token ? input : WETH[pairs[0].networkId],
    ]
    for (const [i, pair] of pairs.entries()) {
      const currentInput = path[i]
      invariant(
        currentInput.equals(pair.token0) || currentInput.equals(pair.token1),
        "PATH",
      )
      const output = currentInput.equals(pair.token0)
        ? pair.token1
        : pair.token0
      path.push(output)
    }

    this.pairs = pairs
    this.path = path
    this.midPrice = Price.fromRoute(this)
    this.input = input
    this.output = output ?? path[path.length - 1]
  }

  public get networkId(): SupportedNetworks {
    return this.pairs[0].networkId
  }
}
