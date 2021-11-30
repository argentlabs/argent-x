export const isValidAddress = (address: string): boolean =>
  /^0x[0-9a-f]{64}$/.test(address)

export const truncateAddress = (address: string) =>
  `${address.slice(0, 2)} ${address.slice(2, 6)} ... ${address.slice(-4)}`
