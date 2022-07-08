import { FC } from "react"
import styled from "styled-components"

import { AutoColumn } from "../../components/Column"
import Row from "../../components/Row"
import { H5 } from "../../components/Typography"
import { formatTruncatedAddress } from "../../services/addresses"
import { Account } from "./Account"
import { getAccountName, useAccountMetadata } from "./accountMetadata.state"
import { getAccountImageUrl } from "./accounts.service"
import { ProfilePicture } from "./ProfilePicture"

interface AddressBookMenuProps {
  addressBook: Account[]
  onAddressSelect: (address: string) => void
}

const MenuContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: #333332;
  border: 1px solid #333332;
  border-radius: 0px 0px 8px 8px;
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
  color: #8f8e8c;
`

export const AddressBookMenu: FC<AddressBookMenuProps> = ({
  addressBook,
  onAddressSelect,
}) => {
  const { accountNames } = useAccountMetadata()

  return (
    <MenuContainer>
      {addressBook.map((account) => {
        const accountName = getAccountName(account, accountNames)

        return (
          <MenuItemWrapper
            key={account.address}
            onClick={() => onAddressSelect(account.address)}
          >
            <MenuItem>
              <Row gap="16px">
                <ProfilePicture
                  src={getAccountImageUrl(accountName, account)}
                  width="40px"
                  height="40px"
                ></ProfilePicture>

                <AutoColumn justify="center">
                  <H5>{accountName}</H5>
                  <StyledAccountAddress>
                    {formatTruncatedAddress(account.address)}
                  </StyledAccountAddress>
                </AutoColumn>
              </Row>
            </MenuItem>
          </MenuItemWrapper>
        )
      })}
    </MenuContainer>
  )
}
