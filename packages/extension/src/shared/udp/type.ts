export interface DeclareContract {
  address: string
  classHash: string
  contract: string
  networkId: string
}

export interface DeployContract {
  address: string
  networkId: string
  classHash: string
  constructorCalldata: any // TODO: type
  salt: string
  unique: boolean
}
