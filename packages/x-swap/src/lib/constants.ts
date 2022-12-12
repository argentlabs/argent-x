import { JSBI, Percent, SupportedNetworks, Token, WETH } from "../sdk"

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 200
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
export const BIPS_BASE = JSBI.BigInt(10000)

// 60 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 60

// a list of tokens by chain
type ChainTokenList = {
  readonly [network in SupportedNetworks]: Token[]
}

const WETH_ONLY: ChainTokenList = {
  [SupportedNetworks.MAINNET]: [WETH[SupportedNetworks.MAINNET]],
  [SupportedNetworks.TESTNET]: [WETH[SupportedNetworks.TESTNET]],
  [SupportedNetworks.TESTNET2]: [WETH[SupportedNetworks.TESTNET2]],
}

export const DAI = {
  [SupportedNetworks.TESTNET]: new Token(
    SupportedNetworks.TESTNET,
    "0x03e85bfbb8e2a42b7bead9e88e9a1b19dbccf661471061807292120462396ec9",
    18,
    "DAI",
    "Dai Stablecoin",
  ),
  [SupportedNetworks.MAINNET]: new Token(
    SupportedNetworks.MAINNET,
    "0x00da114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3",
    18,
    "DAI",
    "Dai Stablecoin",
  ),
}
export const USDC = {
  [SupportedNetworks.TESTNET]: new Token(
    SupportedNetworks.TESTNET,
    "0x005a643907b9a4bc6a55e9069c4fd5fd1f5c79a22470690f75556c4736e34426",
    6,
    "USDC",
    "USD//C",
  ),
  [SupportedNetworks.MAINNET]: new Token(
    SupportedNetworks.MAINNET,
    "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
    6,
    "USDC",
    "USD//C",
  ),
}

export const USDT = {
  [SupportedNetworks.TESTNET]: new Token(
    SupportedNetworks.TESTNET,
    "0x386e8d061177f19b3b485c20e31137e6f6bc497cc635ccdfcab96fadf5add6a",
    6,
    "USDT",
    "Tether USD",
  ),
  [SupportedNetworks.MAINNET]: new Token(
    SupportedNetworks.MAINNET,
    "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8",
    6,
    "USDT",
    "Tether USD",
  ),
}

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  ...WETH_ONLY,
  [SupportedNetworks.TESTNET]: [
    ...WETH_ONLY[SupportedNetworks.TESTNET],
    DAI[SupportedNetworks.TESTNET],
    USDC[SupportedNetworks.TESTNET],
    USDT[SupportedNetworks.TESTNET],
  ],
  [SupportedNetworks.MAINNET]: [
    ...WETH_ONLY[SupportedNetworks.MAINNET],
    DAI[SupportedNetworks.MAINNET],
    USDC[SupportedNetworks.MAINNET],
    USDT[SupportedNetworks.MAINNET],
  ],
}

export const MIN_ETH: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(14)) // .0001 ETH
