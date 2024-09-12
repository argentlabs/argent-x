export const mockAddress =
  "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a"

export const validJson = {
  totalPages: 1,
  nfts: [
    {
      token_id: "1",
      contract_address: "mockAddress",
      name: "nft",
      description: "description",

      image_uri: "mockImageUri",
      image_url_copy: "mockImageUrlCopy",
      networkId: "sepolia-alpha",
      owner: {
        account_address:
          "0x05f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
      },
      contract_name: "mockContractName",
    },
  ],
}

export const invalidJson = {
  next_url: null,
  assets: [
    {
      contract_address: "mockAddress",
      name: "nft",
      description: "description",

      image_uri: "mockImageUri",
      image_url_copy: "mockImageUrlCopy",
      networkId: "sepolia-alpha",
      owner: {
        account_address:
          "0x05f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
      },
      contract_name: "mockContractName",
    },
  ],
}

export const emptyJson = {
  next_url: null,
  assets: [],
}

export const expectedValidRes = [
  {
    token_id: "1",
    contract_address: "mockAddress",
    name: "nft",
    description: "description",

    image_uri: "mockImageUri",
    image_url_copy: "mockImageUrlCopy",
    networkId: "sepolia-alpha",
    owner: {
      account_address:
        "0x05f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
    },
    contract_name: "mockContractName",
  },
]

export const expectedValidRes2Accounts = [
  {
    token_id: "1",
    contract_address: "mockAddress",
    name: "nft",
    description: "description",

    image_uri: "mockImageUri",
    image_url_copy: "mockImageUrlCopy",
    networkId: "sepolia-alpha",
    owner: {
      account_address:
        "0x05f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
    },
    contract_name: "mockContractName",
  },
  {
    token_id: "2",
    contract_address: "mockAddress_2",
    name: "nft",
    description: "description",

    image_uri: "mockImageUri",
    image_url_copy: "mockImageUrlCopy",
    networkId: "sepolia-alpha",
    owner: {
      account_address:
        "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    },
    contract_name: "mockContractName",
  },
]
