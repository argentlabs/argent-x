import { FC, useMemo } from "react"
import { IconBar } from "../../components/IconBar"
import styled from "styled-components"

import { PlusCircle } from "../../components/Icons/PlusCircle"
import { H2, H5, P } from "../../theme/Typography"
import Column, { AutoColumn } from "../../components/Column"
import {
  ControlledInputType,
  StyledControlledInput,
} from "../../components/InputText"
import { SearchIcon } from "../../components/Icons/SearchIcon"
import { useForm } from "react-hook-form"
import Row from "../../components/Row"
import { useAddressBook } from "../../services/addressBook"
import { useNetworks } from "../networks/useNetworks"
import { useNavigate } from "react-router-dom"
import { routes } from "../../routes"
import { ProfilePicture } from "../accounts/ProfilePicture"
import { getAccountImageUrl } from "../accounts/accounts.service"
import { formatTruncatedAddress } from "../../services/addresses"
import { makeClickable } from "../../services/a11y"
import { useCallback } from "react"

const Wrapper = styled(AutoColumn)`
  padding: 24px;
`

const SearchBox: ControlledInputType = styled(StyledControlledInput)`
  padding: 10px 12px;
  padding-left: 36px;
  background-color: ${({ theme }) => theme.bg2};
  border: none;

  input {
    font-size: 16px;
    line-height: 21px;
  }
`

const ContactWrapper = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  padding: 16px;
  cursor: pointer;
`

const InputBefore = styled.div`
  position: absolute;
  top: 50%;
  left: 12px;
  transform: translateY(-50%);
`

const StyledContactAddress = styled.p`
  font-weight: 400;
  font-size: 10px;
  line-height: 12px;
  color: ${({ theme }) => theme.text1};
`

const NetworkContainer = styled.div`
  background: rgba(0, 0, 0, 0.4);
  border-radius: 4px;
  padding: 0px 3px 1px;
  font-weight: 600;
  font-size: 9px;
  line-height: 14px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.text2};
`

export const AddContactButton: FC = () => {
  const navigate = useNavigate()

  return (
    <PlusCircle
      style={{ cursor: "pointer" }}
      onClick={() => navigate(routes.settingsAddressbookAdd())}
    />
  )
}

export const AddressbookSettingsScreen: FC = () => {
  const { control, watch } = useForm({
    defaultValues: { query: "" },
  })

  const { contacts } = useAddressBook()
  const navigate = useNavigate()

  const networks = useNetworks()

  const networkNameFromNetworkId = useCallback(
    (networkId: string) => {
      return networks.find((network) => network.id === networkId)?.name
    },
    [networks],
  )

  const currentQueryValue = watch().query

  const contactList = useMemo(() => {
    if (!currentQueryValue) {
      return contacts
    }

    return contacts.filter(({ name, address, networkId }) => {
      const networkName = networkNameFromNetworkId(networkId)

      const query = currentQueryValue.toLowerCase()

      return (
        name.toLowerCase().includes(query) ||
        address.toLowerCase().includes(query) ||
        networkName?.toLowerCase().includes(query)
      )
    })
  }, [contacts, currentQueryValue, networkNameFromNetworkId])

  return (
    <>
      <IconBar back childAfter={<AddContactButton />}>
        <div />
      </IconBar>

      <Wrapper gap="lg">
        <H2>Address book</H2>

        {contacts.length ? (
          <>
            <SearchBox
              autoComplete="off"
              name="query"
              placeholder="Search by name, address or network"
              type="text"
              control={control}
              autoFocus
            >
              <InputBefore>
                <SearchIcon />
              </InputBefore>
            </SearchBox>

            <AutoColumn gap="12px">
              {contactList.map((contact) => {
                const networkName = networkNameFromNetworkId(contact.networkId)
                return (
                  <ContactWrapper
                    key={contact.id}
                    {...makeClickable(() =>
                      navigate(routes.settingsAddressbookEdit(contact.id)),
                    )}
                  >
                    <Row gap="16px">
                      <ProfilePicture
                        src={getAccountImageUrl(contact.name, contact)}
                        size={40}
                      ></ProfilePicture>

                      <Column gap="4px">
                        <H5>{contact.name}</H5>
                        <Row gap="8px">
                          <StyledContactAddress>
                            {formatTruncatedAddress(contact.address)}
                          </StyledContactAddress>
                          <NetworkContainer>{networkName}</NetworkContainer>
                        </Row>
                      </Column>
                    </Row>
                  </ContactWrapper>
                )
              })}
            </AutoColumn>
          </>
        ) : (
          <P>You don’t have any saved addresses.</P>
        )}
      </Wrapper>
    </>
  )
}
