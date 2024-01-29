import { TransactionActionFixture } from "./types"

export const aspect: TransactionActionFixture = {
  actionHash: "a16b5b24e79859e094a31a6c30aa8202b74bb2a0",
  aggregatedData: [
    {
      token: {
        address:
          "0x4a3621276a83251b557a8140e915599ae8e7b6207b067ea701635c0d509801e",
        name: "Mint Square Storefront",
        symbol: "MINTSQ",
        decimals: 0,
        networkId: "mainnet-alpha",
        tokenId: "47458",
        type: "erc721",
      },
      approvals: [],
      amount: BigInt("1"),
      usdValue: "0",
      recipients: [
        {
          address:
            "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
          amount: BigInt("1"),
        },
      ],
      safe: true,
    },
    {
      token: {
        address:
          "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
        iconUrl: "https://dv3jj1unlp2jl.cloudfront.net/128/color/eth.png",
        showAlways: true,
        networkId: "localhost",
        type: "erc20",
      },
      approvals: [],
      amount: BigInt("-100000000000000"),
      usdValue: "-0.1661",
      recipients: [
        {
          address:
            "0x6a0bd9a21ca429395565127efca751660b503c3966b964bdda5029e031380b7",
          amount: BigInt("-97000000000000"),
          usdValue: "0.161117",
        },
        {
          address:
            "0x4c83d3fa770187d7b0a23b3aa7132c7c8273fb4ec3db416f86e4a385596769a",
          amount: BigInt("-3000000000000"),
          usdValue: "0.004983",
        },
      ],
      safe: true,
    },
  ],
  transactionReview: {
    assessment: "neutral",
    reviews: [
      {
        assessment: "neutral",
        assessmentDetails: {
          contract_address:
            "0x02a92f0f860bf7c63fb9ef42cff4137006b309e0e6e1484e42d0b5511959414d",
        },
      },
    ],
    targetedDapp: {
      name: "Lorem Ipsum",
      description: "Lorem ipsum dolor sit amet",
      logoUrl: "https://www.dappland.com/dapps/jediswap/dapp-icon-jediswap.png",
      links: [
        {
          name: "website",
          url: "https://jediswap.xyz",
          position: 1,
        },
        {
          name: "twitter",
          url: "https://twitter.com/jediswap",
          position: 2,
        },
        {
          name: "discord",
          url: "https://discord.gg/jediswap",
          position: 3,
        },
      ],
    },
  },
  transactions: [
    {
      calldata: [
        "1203547651708349271448768365881041305352887755542740175005943917204658012493",
        "2997881207313980570241347267220574957273773683696432153748258537092592926903",
        "0",
        "1681661074",
        "257877205755718",
        "1",
        "1",
        "2097924334809010151269254159849064348527709275410586009206231441117935140894",
        "47458",
        "0",
        "1",
        "0",
        "2",
        "0",
        "2087021424722619777119509474943472645767659996348769578120564519014510906823",
        "0",
        "0",
        "97000000000000",
        "0",
        "2997881207313980570241347267220574957273773683696432153748258537092592926903",
        "0",
        "2087021424722619777119509474943472645767659996348769578120564519014510906823",
        "0",
        "0",
        "3000000000000",
        "0",
        "2163043529925802864713042203646866750762128402292550239405067396543711442586",
        "193537044949007465058234585984543106941963984792689474213073467382301419967",
        "3123624182172242132799495490982949304040176803825006418688666371482845520789",
      ],
      contractAddress:
        "0x02a92f0f860bf7c63fb9ef42cff4137006b309e0e6e1484e42d0b5511959414d",
      entrypoint: "fillOrder",
    },
  ],
  transactionSimulation: [
    {
      approvals: [
        {
          tokenAddress:
            "0x4a3621276a83251b557a8140e915599ae8e7b6207b067ea701635c0d509801e",
          owner:
            "0x6a0bd9a21ca429395565127efca751660b503c3966b964bdda5029e031380b7",
          spender: "0x0",
          tokenId: "47458",
          details: {
            symbol: "MINTSQ",
            name: "Mint Square Storefront",
            tokenURI:
              "ipfs://QmNrLm3JL7DtryfwWjC9vdZm2mbGSwnkS4o4GSWZwqyFCt\u0000",
            tokenType: "erc721",
            decimals: "0",
            usdValue: "0",
          },
        },
      ],
      transfers: [
        {
          tokenAddress:
            "0x4a3621276a83251b557a8140e915599ae8e7b6207b067ea701635c0d509801e",
          from: "0x6a0bd9a21ca429395565127efca751660b503c3966b964bdda5029e031380b7",
          to: "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
          tokenId: "47458",
          details: {
            symbol: "MINTSQ",
            name: "Mint Square Storefront",
            tokenURI:
              "ipfs://QmNrLm3JL7DtryfwWjC9vdZm2mbGSwnkS4o4GSWZwqyFCt\u0000",
            tokenType: "erc721",
            decimals: "0",
            usdValue: "0",
          },
        },
        {
          tokenAddress:
            "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          from: "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
          to: "0x6a0bd9a21ca429395565127efca751660b503c3966b964bdda5029e031380b7",
          value: "97000000000000",
          details: {
            decimals: "18",
            symbol: "ETH",
            name: "Ether",
            tokenType: "erc20",
            usdValue: "0.161117",
            tokenURI: "",
          },
        },
        {
          tokenAddress:
            "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          from: "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
          to: "0x4c83d3fa770187d7b0a23b3aa7132c7c8273fb4ec3db416f86e4a385596769a",
          value: "3000000000000",
          details: {
            decimals: "18",
            symbol: "ETH",
            name: "Ether",
            tokenType: "erc20",
            usdValue: "0.004983",
            tokenURI: "",
          },
        },
      ],
      feeEstimation: {
        overallFee: 3744000037440,
        gasPrice: 1000000010,
        gasUsage: 3744,
        unit: "wei",
        maxFee: 6744000037440,
      },
    },
  ],
}
