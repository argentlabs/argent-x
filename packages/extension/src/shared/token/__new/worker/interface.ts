/**
 * Interface for the Token Worker.
 */
export interface ITokenWorker {
  /**
   * Initialize the token worker.
   */
  initialize(): void

  /**
   * Update the tokens.
   * @returns A promise that resolves when the tokens have been updated.
   */
  updateTokens(): Promise<void>

  /**
   * Update the token balances.
   * @returns A promise that resolves when the token balances have been updated.
   */
  updateTokenBalances(): Promise<void>

  /**
   * Update the token prices.
   * @returns A promise that resolves when the token prices have been updated.
   */
  updateTokenPrices(): Promise<void>
}
