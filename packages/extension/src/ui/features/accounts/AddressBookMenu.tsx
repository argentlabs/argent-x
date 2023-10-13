import { B3 } from "@argent/ui"
import {
  Box,
  Tab,
  TabList,
  TabPanel,
  TabPanelProps,
  TabPanels,
  TabProps,
  Tabs,
} from "@chakra-ui/react"
import { FC, useCallback } from "react"

import type { AddressBookContact } from "../../../shared/addressBook/type"
import { WalletAccount } from "../../../shared/wallet.model"
import { AddressBook } from "../../hooks/useAddressBook"
import { AccountListItem } from "./AccountListItem"

const StyledTab = ({ children, ...rest }: TabProps) => (
  <Tab
    rounded={"lg"}
    px={4}
    py={3}
    border={"1px solid"}
    borderColor={"neutrals.500"}
    color={"neutrals.300"}
    _selected={{
      color: "white",
      bg: "neutrals.500",
    }}
    {...rest}
  >
    <B3>{children}</B3>
  </Tab>
)

const StyledTabPanel = (props: TabPanelProps) => <TabPanel p={0} {...props} />

interface AddressBookMenuProps {
  addressBook: AddressBook
  onAddressSelect: (account: WalletAccount | AddressBookContact) => void
}

export const AddressBookMenu: FC<AddressBookMenuProps> = ({
  addressBook,
  onAddressSelect,
}) => {
  const { userAccounts, contacts } = addressBook

  const hasAddressBookContacts = Boolean(contacts?.length)

  const accountsToList = useCallback(
    (accounts: (WalletAccount | AddressBookContact)[]) => {
      return accounts.map((account) => {
        const accountName = account.name

        return (
          <AccountListItem
            key={account.address}
            accountName={accountName}
            accountAddress={account.address}
            networkId={account.networkId}
            transparent
            onClick={() => onAddressSelect(account)}
            width={"full"}
            avatarSize={9}
            _hover={{ bg: "neutrals.600" }}
            rounded={"none"}
          />
        )
      })
    },
    [onAddressSelect],
  )

  return (
    <Box
      position={"absolute"}
      top={"100%"}
      left={0}
      width={"100%"}
      border={"1px solid"}
      borderColor={"border"}
      roundedBottom={"lg"}
      overflowY={"scroll"}
      maxHeight={"45vh"}
      backgroundColor={"neutrals.700"}
    >
      <Tabs variant="unstyled">
        <TabList p={4} pb={1} gap={2}>
          {hasAddressBookContacts && <StyledTab>Addresses</StyledTab>}
          <StyledTab>My accounts</StyledTab>
        </TabList>
        <TabPanels>
          {hasAddressBookContacts && (
            <StyledTabPanel>{accountsToList(contacts)}</StyledTabPanel>
          )}
          <StyledTabPanel>{accountsToList(userAccounts)}</StyledTabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
}
