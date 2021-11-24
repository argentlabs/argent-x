export const truncateAddress = (address: string) =>
  `${address.slice(0, 6)} ... ${address.slice(-4)}`
