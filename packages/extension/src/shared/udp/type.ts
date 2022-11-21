export interface DeclareContract {
  address: string
  classHash: string
  contract: string
  networkId: string
}

export interface DeployContract {
  address: string
  networkId: string
  /* TODO: add parameters */
}
