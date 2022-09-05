export interface AspectNft {
  contract_address: string
  token_id: string
  name?: string
  description?: string
  image_uri?: string
  image_url_copy?: string
  animation_uri?: string
  external_uri?: string
  owner?: AspectNftOwner
  contract: AspectNftContract
}

interface AspectNftOwner {
  account_address: string
}

export interface AspectNftContract {
  contract_address: string
  name?: string
  symbol?: string
  schema: string // Might be useful in future
  name_custom: string // Collection Name
  image_url: string
}
