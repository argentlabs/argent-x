import { FC, useState } from "react"
import styled from "styled-components"

import { AddressBookContact } from "../../../shared/addressBook"
import Column from "../../components/Column"
import Row from "../../components/Row"
import { makeClickable } from "../../services/a11y"
import { AddressBook } from "../../services/addressBook"
import { formatTruncatedAddress } from "../../services/addresses"
import { H5 } from "../../theme/Typography"
import { Account } from "./Account"
import { getAccountImageUrl } from "./accounts.service"
import { ProfilePicture } from "./ProfilePicture"

const MenuContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: ${({ theme }) => theme.bg2};
  border: 1px solid ${({ theme }) => theme.bg2};
  border-radius: 0px 0px 8px 8px;
  max-height: 45vh;
  overflow-y: scroll;
`

const MenuItemWrapper = styled.div`
  cursor: pointer;

  &:hover,
  &:focus {
    background: rgba(255, 255, 255, 0.15);
    outline: 0;
  }
`

const MenuItem = styled.div`
  padding: 16px;
`
const StyledAccountAddress = styled.p`
  font-weight: 400;
  font-size: 13px;
  line-height: 18px;
  color: ${({ theme }) => theme.text2};
`

const TabsWrapper = styled(Row)`
  gap: 8px;
  padding: 16px 16px 8px 16px;
`

const Tab = styled.div<{ selected: boolean }>`
  background-color: ${({ theme, selected }) =>
    selected ? theme.text3 : "transparent"};
  color: ${({ theme, selected }) => (selected ? theme.white : theme.text2)};
  border: 1px solid
    ${({ theme, selected }) => (selected ? theme.text3 : theme.text2)};
  border-radius: 8px;
  padding: 6px 12px 8px;

  font-weight: 600;
  font-size: 15px;
  line-height: 20px;

  cursor: pointer;
`

export interface AddressBookMenuProps {
  addressBook: AddressBook
  onAddressSelect: (account: Account | AddressBookContact) => void
}

export type AddressBookMenuTabs = "external" | "user"

export const AddressBookMenu: FC<AddressBookMenuProps> = ({
  addressBook,
  onAddressSelect,
}) => {
  const [selectedTab, setSelectedTab] = useState<AddressBookMenuTabs>(
    addressBook.contacts.length > 0 ? "external" : "user",
  )

  const { userAccounts, contacts } = addressBook

  const accountsToList = (accounts: Account[] | AddressBookContact[]) => {
    return accounts.map((account) => {
      const accountName = account.name

      return (
        <MenuItemWrapper
          key={account.address}
          {...makeClickable(() => onAddressSelect(account))}
        >
          <MenuItem>
            <Row gap="16px">
              <ProfilePicture
                src={getAccountImageUrl(accountName, account)}
                size="lg"
              ></ProfilePicture>

              <Column>
                <H5>{accountName}</H5>
                <StyledAccountAddress>
                  {formatTruncatedAddress(account.address)}
                </StyledAccountAddress>
              </Column>
            </Row>
          </MenuItem>
        </MenuItemWrapper>
      )
    })
  }

  return (
    <MenuContainer>
      {/*** Tabs ***/}
      <TabsWrapper>
        {addressBook.contacts.length > 0 && (
          <Tab
            selected={selectedTab === "external"}
            onClick={() => setSelectedTab("external")}
          >
            Addresses
          </Tab>
        )}
        <Tab
          selected={selectedTab === "user"}
          onClick={() => setSelectedTab("user")}
        >
          My accounts
        </Tab>
      </TabsWrapper>

      {/*** Addresses Tab ***/}
      {selectedTab === "external" && accountsToList(contacts)}

      {/*** My accounts Tab ***/}
      {selectedTab === "user" && accountsToList(userAccounts)}
    </MenuContainer>
  )
}
