import type { AnyActivity } from "@argent/x-shared/simulation"

export const CHANGE_SIGNER_ACTIVITIES: AnyActivity[] = [
  {
    actions: [
      {
        defaultProperties: [
          {
            address:
              "0x02418f74a90c5f8488d011c811a6d40148ca3f3491965cf247fb03a85ba88213",
            label: "default_contract",
            type: "address",
            verified: false,
          },
          {
            calldata: [
              "1765301336315676601532060479096852900977484130601559877201289629195991382459",
              "3054856045889167199790395788568711774993534189789049011472882256484377131424",
            ],
            entrypoint: "replace_signer",
            label: "default_call",
            type: "calldata",
          },
        ],
        name: "account_multisig_replace_signer",
        properties: [
          {
            address:
              "0x03e72009beaa727fcd904f75a75799b0158fb67269c4fe4ef16029edee49f9bb",
            label: "account_multisig_replace_signer_removed_signer",
            type: "address",
          },
          {
            address:
              "0x06c0fcbc5948d472c752bd59f229d1e3431bd75a26b7f4532e507c666a5579a0",
            label: "account_multisig_replace_signer_added_signer",
            type: "address",
          },
        ],
      },
    ],
    lastModified: 1725273484704,
    meta: {
      icon: "MultisigReplaceIcon",
      title: "Replace signer",
    },
    status: "success",
    submitted: 1725273484000,
    transaction: {
      hash: "0x031b35c2bd1221f0d1b1be7081db7724b492591d70ca84e606c021641d4f3453",
    },
    transferSummary: [],
    type: "native",
  },
]

export const SEND_ACTIVITIES: AnyActivity[] = [
  {
    actions: [
      {
        defaultProperties: [
          {
            label: "default_contract",
            token: {
              address:
                "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
              decimals: 18,
              iconUrl: "https://dv3jj1unlp2jl.cloudfront.net/128/color/eth.png",
              name: "Ether",
              symbol: "ETH",
              type: "ERC20",
              unknown: false,
            },
            type: "token_address",
          },
          {
            calldata: [
              "838349379419027770435865540859909192769131100758756469463880374432643758894",
              "100000000000000",
              "0",
            ],
            entrypoint: "transfer",
            label: "default_call",
            type: "calldata",
          },
        ],
        name: "ERC20_transfer",
        properties: [
          {
            amount: "100000000000000",
            editable: false,
            label: "ERC20_transfer_amount",
            token: {
              address:
                "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
              decimals: 18,
              iconUrl: "https://dv3jj1unlp2jl.cloudfront.net/128/color/eth.png",
              name: "Ether",
              symbol: "ETH",
              type: "ERC20",
              unknown: false,
            },
            type: "amount",
            usd: "0.25",
          },
          {
            address:
              "0x01da7d2abee399ae7b4721c413a7521a46e748dda0e2368897980d13cc0d3b2e",
            label: "ERC20_transfer_recipient",
            type: "address",
            verified: false,
          },
        ],
      },
    ],
    fees: [
      {
        actualFee: {
          amount: "99443817198622",
          fiatAmount: {
            currency: "USD",
            currencyAmount: 0.2509,
          },
          tokenAddress:
            "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          type: "token",
        },
        to: "0x1176a1bd84444c89232ec27754698e5d2e7e1a7f1539f12027f28b23ec9f3d8",
        type: "gas",
      },
    ],
    lastModified: 1725275485560,
    meta: {
      icon: "SendIcon",
      subtitle: "To: 0x01dA...3b2e",
      title: "Send",
    },
    multisigDetails: {
      signers: [
        "0x06c0fcbc5948d472c752bd59f229d1e3431bd75a26b7f4532e507c666a5579a0",
        "0x0141611519ff946ec55650efff36a1d65c0b253ec39d7742fcf548985294eed0",
      ],
    },
    status: "success",
    submitted: 1725275485000,
    transaction: {
      hash: "0x023e80b5b1ed6b4544042955827bdbf90051170baff24b987df5af9de550fee9",
    },
    transferSummary: [
      {
        asset: {
          amount: "100000000000000",
          tokenAddress:
            "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          type: "token",
        },
        sent: true,
      },
    ],
    type: "native",
  },
  {
    actions: [
      {
        defaultProperties: [
          {
            label: "default_contract",
            token: {
              address:
                "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
              decimals: 18,
              iconUrl: "https://dv3jj1unlp2jl.cloudfront.net/128/color/eth.png",
              name: "Ether",
              symbol: "ETH",
              type: "ERC20",
              unknown: false,
            },
            type: "token_address",
          },
          {
            calldata: [
              "838349379419027770435865540859909192769131100758756469463880374432643758894",
              "10000000000000",
              "0",
            ],
            entrypoint: "transfer",
            label: "default_call",
            type: "calldata",
          },
        ],
        name: "ERC20_transfer",
        properties: [
          {
            amount: "10000000000000",
            editable: false,
            label: "ERC20_transfer_amount",
            token: {
              address:
                "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
              decimals: 18,
              iconUrl: "https://dv3jj1unlp2jl.cloudfront.net/128/color/eth.png",
              name: "Ether",
              symbol: "ETH",
              type: "ERC20",
              unknown: false,
            },
            type: "amount",
            usd: "0.03",
          },
          {
            address:
              "0x01da7d2abee399ae7b4721c413a7521a46e748dda0e2368897980d13cc0d3b2e",
            label: "ERC20_transfer_recipient",
            type: "address",
            verified: false,
          },
        ],
      },
    ],
    fees: [
      {
        actualFee: {
          amount: "99381021054458",
          fiatAmount: {
            currency: "USD",
            currencyAmount: 0.2508,
          },
          tokenAddress:
            "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          type: "token",
        },
        to: "0x1176a1bd84444c89232ec27754698e5d2e7e1a7f1539f12027f28b23ec9f3d8",
        type: "gas",
      },
    ],
    lastModified: 1725275404698,
    meta: {
      icon: "SendIcon",
      subtitle: "To: 0x01dA...3b2e",
      title: "Send",
    },
    multisigDetails: {
      signers: [
        "0x06c0fcbc5948d472c752bd59f229d1e3431bd75a26b7f4532e507c666a5579a0",
        "0x0141611519ff946ec55650efff36a1d65c0b253ec39d7742fcf548985294eed0",
      ],
    },
    status: "success",
    submitted: 1725275404000,
    transaction: {
      hash: "0x03c8112fbd069e4361c5068d3d9808adbf211ab65acc44cc3b0b327b00ac5ea3",
    },
    transferSummary: [
      {
        asset: {
          amount: "10000000000000",
          tokenAddress:
            "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          type: "token",
        },
        sent: true,
      },
    ],
    type: "native",
  },
]
