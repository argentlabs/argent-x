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
}

interface AspectNftOwner {
  owner_address: string
}
