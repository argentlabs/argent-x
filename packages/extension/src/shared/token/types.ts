/** shape of individual entity in the /tokens/info endpoint */
export interface ApiTokenDetails {
  id: number
  address: string
  pricingId: number
}

export interface ApiTokenDataResponse {
  tokens: ApiTokenDetails[]
}

/** shape of individual entity in the /tokens/prices endpoint */
export interface ApiPriceDetails {
  pricingId: number
  ethValue: string
  ccyValue: string
  ethDayChange: string
  ccyDayChange: string
}

export interface ApiPriceDataResponse {
  prices: ApiPriceDetails[]
}
