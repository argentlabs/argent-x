import { number } from "starknet"

export interface AspectNft {
  best_bid_order?: {
    payment_address: string
    payment_amount: number.BigNumberish
    payment_amount_per: number.BigNumberish
  }
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
  floor_list_price: number.BigNumberish
}

export interface AspectContract {
  contract_address: string
  name: string
  symbol: string
  schema: string
  name_custom: string
  image_url: string
  banner_image_url: string
  total_volume_all_time: string
  total_volume_720_hours: string
  total_volume_168_hours: string
  total_volume_24_hours: string
  volume_change_basis_points_720_hours: string
  volume_change_basis_points_168_hours: string | null
  volume_change_basis_points_24_hours: string | null
  number_of_owners: string
  number_of_assets: string
  floor_list_price: string
}
