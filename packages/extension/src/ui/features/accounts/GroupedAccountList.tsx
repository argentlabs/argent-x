import { H6 } from "@argent/ui"
import { Box, Flex } from "@chakra-ui/react"
import { isEmpty } from "lodash-es"
import { FC } from "react"

import { Account } from "./Account"
import { AccountListScreenItem } from "./AccountListScreenItem"

export interface GroupedAccountListProps {
  title: string
  accounts: Account[]
  icon: React.ReactNode
  selectedAccount?: Account
  returnTo?: string
}

export const GroupedAccountList: FC<GroupedAccountListProps> = ({
  title,
  accounts,
  icon,
  selectedAccount,
  returnTo,
}) => {
  return !isEmpty(accounts) ? (
    <Flex direction="column" gap={3} alignItems="flex-start">
      <Flex gap={2} align="center" color="neutrals.300" px={2}>
        {icon}
        <H6>{title}</H6>
      </Flex>
      {accounts.map((account) => (
        <Box key={account.address} w="full">
          <AccountListScreenItem
            account={account}
            selectedAccount={selectedAccount}
            returnTo={returnTo}
          />
        </Box>
      ))}
    </Flex>
  ) : (
    <></>
  )
}
