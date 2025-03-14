import { AccountSelect } from "@argent-x/extension/src/ui/features/accounts/AccountSelect"
import { P2 } from "@argent/x-ui"
import type { ComponentProps } from "react"

export default {
  component: AccountSelect,
  render: (props: ComponentProps<typeof AccountSelect>) => {
    return (
      <>
        <AccountSelect {...props} />
        <P2 mt={4}>Lorem ipsum dolor sit amet</P2>
      </>
    )
  },
}

const accounts = [
  {
    accountName: "Account 1",
    accountAddress:
      "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
    networkId: "sepolia-alpha",
  },
  {
    accountName: "Account 2",
    accountAddress:
      "0x69b49c2cc8b16e80e86bfc5b0614a59aa8c9b601569c7b80dde04d3f3151b79",
    networkId: "sepolia-alpha",
  },
  {
    accountName: "Account 3",
    accountAddress:
      "0x7447084f620ba316a42c72ca5b8eefb3fe9a05ca5fe6430c65a69ecc4349b3b",
    networkId: "sepolia-alpha",
  },
  {
    accountName: "Account 4",
    accountAddress:
      "0x3cad9a072d3cf29729ab2fad2e08972b8cfde01d4979083fb6d15e8e66f8ab1",
    networkId: "sepolia-alpha",
  },
  {
    accountName: "Account 5",
    accountAddress:
      "0x7f14339f5d364946ae5e27eccbf60757a5c496bf45baf35ddf2ad30b583541a",
    networkId: "sepolia-alpha",
  },
  {
    accountName: "Account 6",
    accountAddress:
      "0x27d32a3033df4277caa9e9396100b7ca8c66a4ef8ea5f6765b91a7c17f0109c",
    networkId: "sepolia-alpha",
  },
  {
    accountName: "Account 7",
    accountAddress:
      "0x19299c32cf2dcf9432a13c0cee07077d711faadd08f59049ca602e070c9ebb",
    networkId: "sepolia-alpha",
  },
  {
    accountName: "Account 8",
    accountAddress:
      "0x1d07131135aeb92eea44a341d94a01161edb1adab4c98ac56523d24e00183aa",
    networkId: "sepolia-alpha",
  },
]

export const Default = {
  args: {
    accounts,
    selectedAccount: accounts[3],
  },
}
