export const truncateAddress = (address: string) =>
  `${address.slice(0, 2)} ${address.slice(2, 6)} ... ${address.slice(-4)}`
