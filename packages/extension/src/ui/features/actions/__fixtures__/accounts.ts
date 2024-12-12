import type { WalletAccount } from "../../../../shared/wallet.model"

export const accounts = [
  {
    name: "Account 1",
    address:
      "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
    networkId: "sepolia-alpha",
    network: {
      name: "sepolia-alpha",
    },
    id: "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a::sepolia-alpha::local_secret::0",
    signer: {
      type: "local_secret",
      derivationPath: "m/44'/9004'/0'/0/0",
    },
  },
  {
    name: "Account 2",
    address:
      "0x69b49c2cc8b16e80e86bfc5b0614a59aa8c9b601569c7b80dde04d3f3151b79",
    networkId: "sepolia-alpha",
    network: {
      name: "sepolia-alpha",
    },
    id: "0x69b49c2cc8b16e80e86bfc5b0614a59aa8c9b601569c7b80dde04d3f3151b79::sepolia-alpha::local_secret::1",
    signer: {
      type: "local_secret",
      derivationPath: "m/44'/9004'/0'/0/1",
    },
  },
  {
    name: "Account 3",
    address:
      "0x7447084f620ba316a42c72ca5b8eefb3fe9a05ca5fe6430c65a69ecc4349b3b",
    networkId: "sepolia-alpha",
    network: {
      name: "sepolia-alpha",
    },
    id: "0x7447084f620ba316a42c72ca5b8eefb3fe9a05ca5fe6430c65a69ecc4349b3b::sepolia-alpha::local_secret::2",
    signer: {
      type: "local_secret",
      derivationPath: "m/44'/9004'/0'/0/2",
    },
  },
  {
    name: "Account 4",
    address:
      "0x3cad9a072d3cf29729ab2fad2e08972b8cfde01d4979083fb6d15e8e66f8ab1",
    networkId: "sepolia-alpha",
    network: {
      name: "sepolia-alpha",
    },
    id: "0x3cad9a072d3cf29729ab2fad2e08972b8cfde01d4979083fb6d15e8e66f8ab1::sepolia-alpha::local_secret::3",
    signer: {
      type: "local_secret",
      derivationPath: "m/44'/9004'/0'/0/3",
    },
  },
  {
    name: "Account 5",
    address:
      "0x7f14339f5d364946ae5e27eccbf60757a5c496bf45baf35ddf2ad30b583541a",
    networkId: "sepolia-alpha",
    network: {
      name: "sepolia-alpha",
    },
    id: "0x7f14339f5d364946ae5e27eccbf60757a5c496bf45baf35ddf2ad30b583541a::sepolia-alpha::local_secret::4",
    signer: {
      type: "local_secret",
      derivationPath: "m/44'/9004'/0'/0/4",
    },
  },
  {
    name: "Account 6",
    address:
      "0x27d32a3033df4277caa9e9396100b7ca8c66a4ef8ea5f6765b91a7c17f0109c",
    networkId: "sepolia-alpha",
    network: {
      name: "sepolia-alpha",
    },
    id: "0x27d32a3033df4277caa9e9396100b7ca8c66a4ef8ea5f6765b91a7c17f0109c::sepolia-alpha::local_secret::5",
    signer: {
      type: "local_secret",
      derivationPath: "m/44'/9004'/0'/0/5",
    },
  },
  {
    name: "Account 7",
    address: "0x19299c32cf2dcf9432a13c0cee07077d711faadd08f59049ca602e070c9ebb",
    networkId: "sepolia-alpha",
    network: {
      name: "sepolia-alpha",
    },
    id: "0x19299c32cf2dcf9432a13c0cee07077d711faadd08f59049ca602e070c9ebb::sepolia-alpha::local_secret::6",
    signer: {
      type: "local_secret",
      derivationPath: "m/44'/9004'/0'/0/6",
    },
  },
  {
    name: "Account 8",
    address:
      "0x1d07131135aeb92eea44a341d94a01161edb1adab4c98ac56523d24e00183aa",
    networkId: "sepolia-alpha",
    network: {
      name: "sepolia-alpha",
    },
    id: "0x1d07131135aeb92eea44a341d94a01161edb1adab4c98ac56523d24e00183aa::sepolia-alpha::local_secret::7",
    signer: {
      type: "local_secret",
      derivationPath: "m/44'/9004'/0'/0/7",
    },
  },
] as WalletAccount[]
