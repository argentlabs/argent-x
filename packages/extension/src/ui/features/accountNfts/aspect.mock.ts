import { toBigInt } from "ethers"

export const mockAddress =
  "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a"

export const validJson = {
  next_url: null,
  assets: [
    {
      id: "0483e1a7-314a-4d26-bfbf-f22407e2b2d0",
      contract_address:
        "0x0798e884450c19e072d6620fefdbeb7387d0453d3fd51d95f5ace1f17633d88b",
      token_id: "957339187530",
      name: "Starknet ID: 957339187530",
      description:
        "This token represents an identity on StarkNet that can be linked to external services.",
      token_uri: "https://goerli.indexer.starknet.id/uri?id=957339187530",
      image_uri: "https://starknet.id/api/identicons/957339187530",
      image_blur_hash: "UEC?TWWF00xp_NofDiRj0Nt3$tIZ8^Rk%hxY",
      image_url_copy:
        "https://cdn-testnet.aspect.co/assets/0483e1a7-314a-4d26-bfbf-f22407e2b2d0/images/QmSPSLF5JddoiPLRxbGMavkWXw4VsD3Ltix8sGRPppKsRM",
      image_small_url_copy:
        "https://cdn-testnet.aspect.co/assets/0483e1a7-314a-4d26-bfbf-f22407e2b2d0/images/QmSPSLF5JddoiPLRxbGMavkWXw4VsD3Ltix8sGRPppKsRM?s=256",
      image_medium_url_copy:
        "https://cdn-testnet.aspect.co/assets/0483e1a7-314a-4d26-bfbf-f22407e2b2d0/images/QmSPSLF5JddoiPLRxbGMavkWXw4VsD3Ltix8sGRPppKsRM?s=896",
      animation_uri: null,
      animation_url_copy: null,
      external_uri: null,
      attributes: null,
      aspect_link:
        "https://testnet.aspect.co/asset/0x0798e884450c19e072d6620fefdbeb7387d0453d3fd51d95f5ace1f17633d88b/957339187530",
      contract: {
        contract_address:
          "0x0798e884450c19e072d6620fefdbeb7387d0453d3fd51d95f5ace1f17633d88b",
        name: "Starknet.id",
        symbol: "ID",
        schema: "ERC721",
        name_custom: "Starknet.id (OLD)",
        image_url:
          "https://cdn-testnet.aspect.co/contracts/custom/0x0798e884450c19e072d6620fefdbeb7387d0453d3fd51d95f5ace1f17633d88b/starknetid-pfp.jpg",
        banner_image_url:
          "https://cdn-testnet.aspect.co/contracts/custom/0x0798e884450c19e072d6620fefdbeb7387d0453d3fd51d95f5ace1f17633d88b/starknetid-banner.jpg",
        total_volume_all_time: "496791575504925000000",
        total_volume_720_hours: "36580015000000000000",
        total_volume_168_hours: "12290250000000000000",
        total_volume_24_hours: "134000000000000000",
        volume_change_basis_points_720_hours: "55588",
        volume_change_basis_points_168_hours: "12921",
        volume_change_basis_points_24_hours: "4068",
        number_of_owners: "138390",
        number_of_assets: "389089",
        floor_list_price: "75000000000000000",
      },
      owner: {
        account_address:
          "0x05f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
        quantity: "1",
      },
      best_list_order: null,
      best_bid_order: null,
    },
    {
      id: "05084b67-6db9-4b31-bc28-e32377796195",
      contract_address:
        "0x0798e884450c19e072d6620fefdbeb7387d0453d3fd51d95f5ace1f17633d88b",
      token_id: "854406733492",
      name: "Starknet ID: 854406733492",
      description:
        "This token represents an identity on StarkNet that can be linked to external services.",
      token_uri: "https://goerli.indexer.starknet.id/uri?id=854406733492",
      image_uri: "https://starknet.id/api/identicons/854406733492",
      image_blur_hash: "UHE|SGs:0KI.tSj[Rij?00R*_P%1R4WBkrWX",
      image_url_copy:
        "https://cdn-testnet.aspect.co/assets/05084b67-6db9-4b31-bc28-e32377796195/images/QmdVEssKpfLszCgK15qo9fXWxmLHTusZgxNumK3xev6iB7",
      image_small_url_copy:
        "https://cdn-testnet.aspect.co/assets/05084b67-6db9-4b31-bc28-e32377796195/images/QmdVEssKpfLszCgK15qo9fXWxmLHTusZgxNumK3xev6iB7?s=256",
      image_medium_url_copy:
        "https://cdn-testnet.aspect.co/assets/05084b67-6db9-4b31-bc28-e32377796195/images/QmdVEssKpfLszCgK15qo9fXWxmLHTusZgxNumK3xev6iB7?s=896",
      animation_uri: null,
      animation_url_copy: null,
      external_uri: null,
      attributes: null,
      aspect_link:
        "https://testnet.aspect.co/asset/0x0798e884450c19e072d6620fefdbeb7387d0453d3fd51d95f5ace1f17633d88b/854406733492",
      contract: {
        contract_address:
          "0x0798e884450c19e072d6620fefdbeb7387d0453d3fd51d95f5ace1f17633d88b",
        name: "Starknet.id",
        symbol: "ID",
        schema: "ERC721",
        name_custom: "Starknet.id (OLD)",
        image_url:
          "https://cdn-testnet.aspect.co/contracts/custom/0x0798e884450c19e072d6620fefdbeb7387d0453d3fd51d95f5ace1f17633d88b/starknetid-pfp.jpg",
        banner_image_url:
          "https://cdn-testnet.aspect.co/contracts/custom/0x0798e884450c19e072d6620fefdbeb7387d0453d3fd51d95f5ace1f17633d88b/starknetid-banner.jpg",
        total_volume_all_time: "496791575504925000000",
        total_volume_720_hours: "36580015000000000000",
        total_volume_168_hours: "12290250000000000000",
        total_volume_24_hours: "134000000000000000",
        volume_change_basis_points_720_hours: "55588",
        volume_change_basis_points_168_hours: "12921",
        volume_change_basis_points_24_hours: "4068",
        number_of_owners: "138390",
        number_of_assets: "389089",
        floor_list_price: "75000000000000000",
      },
      owner: {
        account_address:
          "0x05f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
        quantity: "1",
      },
      best_list_order: null,
      best_bid_order: null,
    },
  ],
}

export const invalidJson = {
  next_url: null,
  assets: [
    {
      id: "0483e1a7-314a-4d26-bfbf-f22407e2b2d0",
      contract_address: 123456,
      token_id: "957339187530",
      name: "Starknet ID: 957339187530",
      description:
        "This token represents an identity on StarkNet that can be linked to external services.",
      token_uri: "https://goerli.indexer.starknet.id/uri?id=957339187530",
      image_uri: "https://starknet.id/api/identicons/957339187530",
      image_blur_hash: "UEC?TWWF00xp_NofDiRj0Nt3$tIZ8^Rk%hxY",
      image_url_copy:
        "https://cdn-testnet.aspect.co/assets/0483e1a7-314a-4d26-bfbf-f22407e2b2d0/images/QmSPSLF5JddoiPLRxbGMavkWXw4VsD3Ltix8sGRPppKsRM",
      image_small_url_copy:
        "https://cdn-testnet.aspect.co/assets/0483e1a7-314a-4d26-bfbf-f22407e2b2d0/images/QmSPSLF5JddoiPLRxbGMavkWXw4VsD3Ltix8sGRPppKsRM?s=256",
      image_medium_url_copy:
        "https://cdn-testnet.aspect.co/assets/0483e1a7-314a-4d26-bfbf-f22407e2b2d0/images/QmSPSLF5JddoiPLRxbGMavkWXw4VsD3Ltix8sGRPppKsRM?s=896",
      animation_uri: 123456,
      animation_url_copy: null,
      external_uri: null,
      attributes: null,
      aspect_link:
        "https://testnet.aspect.co/asset/0x0798e884450c19e072d6620fefdbeb7387d0453d3fd51d95f5ace1f17633d88b/957339187530",
      contract: {
        contract_address:
          "0x0798e884450c19e072d6620fefdbeb7387d0453d3fd51d95f5ace1f17633d88b",
        name: "Starknet.id",
        symbol: "ID",
        schema: "ERC721",
        name_custom: "Starknet.id (OLD)",
        image_url:
          "https://cdn-testnet.aspect.co/contracts/custom/0x0798e884450c19e072d6620fefdbeb7387d0453d3fd51d95f5ace1f17633d88b/starknetid-pfp.jpg",
        banner_image_url:
          "https://cdn-testnet.aspect.co/contracts/custom/0x0798e884450c19e072d6620fefdbeb7387d0453d3fd51d95f5ace1f17633d88b/starknetid-banner.jpg",
        total_volume_all_time: "496791575504925000000",
        total_volume_720_hours: "36580015000000000000",
        total_volume_168_hours: "12290250000000000000",
        total_volume_24_hours: "134000000000000000",
        volume_change_basis_points_720_hours: "55588",
        volume_change_basis_points_168_hours: "12921",
        volume_change_basis_points_24_hours: "4068",
        number_of_owners: "138390",
        number_of_assets: "389089",
        floor_list_price: "75000000000000000",
      },
      owner: {
        account_address:
          "0x05f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
        quantity: "1",
      },
      best_list_order: null,
      best_bid_order: null,
    },
    {
      id: "05084b67-6db9-4b31-bc28-e32377796195",
      contract_address:
        "0x0798e884450c19e072d6620fefdbeb7387d0453d3fd51d95f5ace1f17633d88b",
      token_id: "854406733492",
      name: "Starknet ID: 854406733492",
      description:
        "This token represents an identity on StarkNet that can be linked to external services.",
      token_uri: "https://goerli.indexer.starknet.id/uri?id=854406733492",
      image_uri: "https://starknet.id/api/identicons/854406733492",
      image_blur_hash: "UHE|SGs:0KI.tSj[Rij?00R*_P%1R4WBkrWX",
      image_url_copy:
        "https://cdn-testnet.aspect.co/assets/05084b67-6db9-4b31-bc28-e32377796195/images/QmdVEssKpfLszCgK15qo9fXWxmLHTusZgxNumK3xev6iB7",
      image_small_url_copy:
        "https://cdn-testnet.aspect.co/assets/05084b67-6db9-4b31-bc28-e32377796195/images/QmdVEssKpfLszCgK15qo9fXWxmLHTusZgxNumK3xev6iB7?s=256",
      image_medium_url_copy:
        "https://cdn-testnet.aspect.co/assets/05084b67-6db9-4b31-bc28-e32377796195/images/QmdVEssKpfLszCgK15qo9fXWxmLHTusZgxNumK3xev6iB7?s=896",
      animation_uri: null,
      animation_url_copy: null,
      external_uri: null,
      attributes: null,
      aspect_link:
        "https://testnet.aspect.co/asset/0x0798e884450c19e072d6620fefdbeb7387d0453d3fd51d95f5ace1f17633d88b/854406733492",
      contract: {
        contract_address:
          "0x0798e884450c19e072d6620fefdbeb7387d0453d3fd51d95f5ace1f17633d88b",
        name: "Starknet.id",
        symbol: "ID",
        schema: "ERC721",
        name_custom: "Starknet.id (OLD)",
        image_url:
          "https://cdn-testnet.aspect.co/contracts/custom/0x0798e884450c19e072d6620fefdbeb7387d0453d3fd51d95f5ace1f17633d88b/starknetid-pfp.jpg",
        banner_image_url:
          "https://cdn-testnet.aspect.co/contracts/custom/0x0798e884450c19e072d6620fefdbeb7387d0453d3fd51d95f5ace1f17633d88b/starknetid-banner.jpg",
        total_volume_all_time: "496791575504925000000",
        total_volume_720_hours: "36580015000000000000",
        total_volume_168_hours: "12290250000000000000",
        total_volume_24_hours: "134000000000000000",
        volume_change_basis_points_720_hours: "55588",
        volume_change_basis_points_168_hours: "12921",
        volume_change_basis_points_24_hours: "4068",
        number_of_owners: "138390",
        number_of_assets: "389089",
        floor_list_price: "75000000000000000",
      },
      owner: {
        account_address:
          "0x05f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
        quantity: "1",
      },
      best_list_order: null,
      best_bid_order: null,
    },
  ],
}

export const emptyJson = {
  next_url: null,
  assets: [],
}

export const expectedValidRes = [
  {
    contract_address:
      "0x0798e884450c19e072d6620fefdbeb7387d0453d3fd51d95f5ace1f17633d88b",
    token_id: "957339187530",
    name: "Starknet ID: 957339187530",
    description:
      "This token represents an identity on StarkNet that can be linked to external services.",

    image_uri: "https://starknet.id/api/identicons/957339187530",

    image_url_copy:
      "https://cdn-testnet.aspect.co/assets/0483e1a7-314a-4d26-bfbf-f22407e2b2d0/images/QmSPSLF5JddoiPLRxbGMavkWXw4VsD3Ltix8sGRPppKsRM",

    animation_uri: null,
    external_uri: null,
    contract: {
      contract_address:
        "0x0798e884450c19e072d6620fefdbeb7387d0453d3fd51d95f5ace1f17633d88b",
      name: "Starknet.id",
      symbol: "ID",
      schema: "ERC721",
      name_custom: "Starknet.id (OLD)",
      image_url:
        "https://cdn-testnet.aspect.co/contracts/custom/0x0798e884450c19e072d6620fefdbeb7387d0453d3fd51d95f5ace1f17633d88b/starknetid-pfp.jpg",

      floor_list_price: toBigInt("0x010a741a46278000"),
    },
    owner: {
      account_address:
        "0x05f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
    },
    best_bid_order: null,
  },
  {
    contract_address:
      "0x0798e884450c19e072d6620fefdbeb7387d0453d3fd51d95f5ace1f17633d88b",
    token_id: "854406733492",
    name: "Starknet ID: 854406733492",
    description:
      "This token represents an identity on StarkNet that can be linked to external services.",
    image_uri: "https://starknet.id/api/identicons/854406733492",
    image_url_copy:
      "https://cdn-testnet.aspect.co/assets/05084b67-6db9-4b31-bc28-e32377796195/images/QmdVEssKpfLszCgK15qo9fXWxmLHTusZgxNumK3xev6iB7",
    animation_uri: null,
    best_bid_order: null,
    external_uri: null,
    contract: {
      contract_address:
        "0x0798e884450c19e072d6620fefdbeb7387d0453d3fd51d95f5ace1f17633d88b",
      name: "Starknet.id",
      symbol: "ID",
      schema: "ERC721",
      name_custom: "Starknet.id (OLD)",
      image_url:
        "https://cdn-testnet.aspect.co/contracts/custom/0x0798e884450c19e072d6620fefdbeb7387d0453d3fd51d95f5ace1f17633d88b/starknetid-pfp.jpg",

      floor_list_price: toBigInt("0x010a741a46278000"),
    },
    owner: {
      account_address:
        "0x05f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25",
    },
  },
]
