import { FC, useMemo } from "react"
import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { AutoColumn } from "../../components/Column"
import { IconBar } from "../../components/IconBar"
import { PlusCircle } from "../../components/Icons/PlusCircle"
import { SearchIcon } from "../../components/Icons/SearchIcon"
import {
  ControlledInputType,
  StyledControlledInput,
} from "../../components/InputText"
import { routes } from "../../routes"
import { makeClickable } from "../../services/a11y"
import { useAddressBook } from "../../services/addressBook"
import { H2, P } from "../../theme/Typography"
import { AccountListItem } from "../accounts/AccountListItem"
import { useNetworks } from "../networks/useNetworks"

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

const InputBefore = styled.div`
  position: absolute;
  top: 50%;
  left: 12px;
  transform: translateY(-50%);
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
                  <AccountListItem
                    key={contact.id}
                    accountType="argent"
                    accountAddress={contact.address}
                    networkId={contact.networkId}
                    accountName={contact.name}
                    networkName={networkName}
                    outlined
                    transparent
                    style={{ padding: "16px" }}
                    {...makeClickable(() =>
                      navigate(routes.settingsAddressbookEdit(contact.id)),
                    )}
                  />
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
