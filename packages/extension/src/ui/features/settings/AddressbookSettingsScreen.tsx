import {
  BarAddButton,
  BarBackButton,
  CellStack,
  Input,
  NavigationContainer,
  icons,
} from "@argent/ui"
import { Box, Text, VStack } from "@chakra-ui/react"
import { FC, useCallback, useMemo } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"

import { routes } from "../../routes"
import { makeClickable } from "../../services/a11y"
import { useAddressBook } from "../../services/addressBook"
import { P } from "../../theme/Typography"
import { AccountListItem } from "../accounts/AccountListItem"
import { useNetworks } from "../networks/useNetworks"

const { SearchIcon } = icons

export const AddressbookSettingsScreen: FC = () => {
  const { register, watch } = useForm({
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
    <NavigationContainer
      leftButton={<BarBackButton />}
      rightButton={
        <BarAddButton
          onClick={() => navigate(routes.settingsAddressbookAdd())}
          aria-label="add"
        />
      }
      title={"Address book"}
    >
      <VStack p="4" gap="5">
        {contacts.length ? (
          <>
            <Box position="relative" w="100%">
              <Input
                autoComplete="off"
                placeholder="Search by name, address or network"
                type="text"
                {...register("query")}
                autoFocus
              ></Input>
              <Text
                position="absolute"
                top="50%"
                right="4"
                transform="translateY(-50%)"
                fontSize="base"
              >
                <SearchIcon />
              </Text>
            </Box>

            <CellStack p="0" gap="3" w="100%">
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
                    p={3}
                    {...makeClickable(() =>
                      navigate(routes.settingsAddressbookEdit(contact.id)),
                    )}
                  />
                )
              })}
            </CellStack>
          </>
        ) : (
          <P>You don’t have any saved addresses.</P>
        )}
      </VStack>
    </NavigationContainer>
  )
}
