import type { Meta, StoryObj } from "@storybook/react"
import type { AccountCollectionsProps } from "@argent-x/extension/src/ui/features/accountNfts/AccountCollections"
import { AccountCollections } from "@argent-x/extension/src/ui/features/accountNfts/AccountCollections"

import { decorators } from "../../decorators/routerDecorators"

import accountCollections from "./__fixtures__/account-collections.json"

const meta: Meta<typeof AccountCollections> = {
  component: AccountCollections,
  decorators,
}

export default meta

type Story = StoryObj<typeof AccountCollections>

const account = {
  id: "0x07d26980311893f16b5f5b93cc2aa372ce34944e9efa2c43d47b3d8a4287b386::mainnet-alpha::local_secret::0",
  address: "0x07d26980311893f16b5f5b93cc2aa372ce34944e9efa2c43d47b3d8a4287b386",
  networkId: "mainnet-alpha",
}

export const Default: Story = {
  args: {
    account,
    collections: accountCollections as AccountCollectionsProps["collections"],
  },
}

export const Empty: Story = {
  args: {
    account,
    collections: [],
  },
}
