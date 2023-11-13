import {
  BarAddButton,
  BarBackButton,
  Button,
  CellStack,
  Empty,
  FieldError,
  HeaderCell,
  NavigationContainer,
  TextareaAutosize,
  icons,
} from "@argent/ui"
import {
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react"
import { BaseSyntheticEvent, FC, ReactNode } from "react"
import { FieldErrors, UseFormRegister } from "react-hook-form"

import type { AddressBookContact } from "../../../shared/addressBook/type"
import type { WalletAccount } from "../../../shared/wallet.model"
import { useAutoFocusInputRef } from "../../hooks/useAutoFocusInputRef"
import { AccountListItem } from "../accounts/AccountListItem"
import { AccountListItemWithBalance } from "../accounts/AccountListItemWithBalance"
import { SendModalAddContactScreen } from "./SendModalAddContactScreen"
import { FormType } from "./sendRecipientScreen.model"
import {
  addressInputCharactersAndLengthSchema,
  getAccountIdentifier,
} from "@argent/shared"

const { SearchIcon, WalletIcon, AddressBookIcon, CloseIcon } = icons

interface SendRecipientScreenProps {
  errors: FieldErrors<FormType>
  hasAccounts?: boolean
  filteredAccounts: WalletAccount[]
  filteredContacts: AddressBookContact[]
  hasQueryError: boolean
  isLoading: boolean
  isAddContactOpen: boolean
  onAccountClick: (account: WalletAccount) => void
  onBack: () => void
  onClearQuery: () => void
  onCloseAddContact: () => void
  onContactClick: (contact: AddressBookContact) => void
  onOpenAddContact: () => void
  onQuerySubmit: (e?: BaseSyntheticEvent) => void
  onSaveContact: (contact: AddressBookContact) => void
  onQueryPaste: (query: string) => void
  placeholderValidAddress: ReactNode
  query: string
  register: UseFormRegister<FormType>
  switcherNetworkId: string
}

export const SendRecipientScreen: FC<SendRecipientScreenProps> = ({
  errors,
  hasAccounts,
  filteredAccounts,
  filteredContacts,
  hasQueryError,
  isLoading,
  isAddContactOpen,
  onAccountClick,
  onBack,
  onClearQuery,
  onCloseAddContact,
  onContactClick,
  onOpenAddContact,
  onQuerySubmit,
  onSaveContact,
  onQueryPaste,
  placeholderValidAddress,
  query,
  register,
  switcherNetworkId,
}) => {
  const { ref, onChange, ...rest } = register("query")
  const inputRef = useAutoFocusInputRef<HTMLTextAreaElement>()

  const hasFilteredAccounts = filteredAccounts.length > 0
  const hasFilteredContacts = filteredContacts.length > 0
  const hasQuery = Boolean(query)

  const defaultTabIndex = hasAccounts ? 0 : 1

  return (
    <>
      <NavigationContainer
        leftButton={<BarBackButton onClick={onBack} />}
        rightButton={<BarAddButton onClick={onOpenAddContact} />}
        title={"Send to"}
      >
        <CellStack pt={0} flex={1}>
          <HeaderCell>Recipient</HeaderCell>
          <form onSubmit={onQuerySubmit}>
            <InputGroup size="sm">
              <InputLeftElement pointerEvents="none" h={"full"}>
                <SearchIcon />
              </InputLeftElement>
              <TextareaAutosize
                {...rest}
                ref={(e) => {
                  ref(e)
                  inputRef.current = e
                }}
                px={10}
                pt={3}
                autoComplete="off"
                placeholder="Address (0x) or Starknet ID"
                isInvalid={hasQueryError}
                autoCorrect="off"
                spellCheck="false"
                value={query}
                onKeyDown={(e) => {
                  /** This is a textarea, so must intercept Enter key for submit */
                  if (e.key === "Enter" && !hasQueryError) {
                    onQuerySubmit()
                  }
                }}
                onChange={(e) => {
                  if (
                    addressInputCharactersAndLengthSchema.safeParse(
                      e.target.value,
                    ).success
                  ) {
                    onChange(e)
                  }
                }}
                onPaste={(e) => {
                  const value = e.clipboardData.getData("Text")
                  if (
                    addressInputCharactersAndLengthSchema.safeParse(value)
                      .success
                  ) {
                    onQueryPaste(value)
                  }
                }}
              />
              {isLoading && (
                <InputRightElement pointerEvents="none" h={"full"}>
                  <Spinner size={"sm"} />
                </InputRightElement>
              )}
              {!isLoading && hasQuery && (
                <InputRightElement h={"full"}>
                  <Button
                    onClick={onClearQuery}
                    size="auto"
                    rounded="full"
                    p={1.5}
                    fontSize={"2xs"}
                    color={"neutrals.400"}
                  >
                    <CloseIcon />
                  </Button>
                </InputRightElement>
              )}
            </InputGroup>
            {hasQueryError && <FieldError>{errors.query?.message}</FieldError>}
          </form>

          {placeholderValidAddress}

          {!placeholderValidAddress && (
            <Tabs
              flex={1}
              display={"flex"}
              flexDirection={"column"}
              mt={4}
              defaultIndex={defaultTabIndex}
            >
              <TabList>
                <Tab>My accounts</Tab>
                <Tab>Address book</Tab>
              </TabList>
              <TabPanels flex={1} display={"flex"} flexDirection={"column"}>
                <TabPanel flex={1} display={"flex"} flexDirection={"column"}>
                  {hasFilteredAccounts ? (
                    <CellStack px={0} pt={4}>
                      {filteredAccounts.map((account) => (
                        <AccountListItemWithBalance
                          key={getAccountIdentifier(account)}
                          account={account}
                          avatarSize={9}
                          accountAddress={account.address}
                          networkId={account.networkId}
                          accountName={account.name}
                          onClick={() => onAccountClick(account)}
                        />
                      ))}
                    </CellStack>
                  ) : (
                    <Empty
                      icon={hasQuery ? <SearchIcon /> : <WalletIcon />}
                      title={hasQuery ? `No matching accounts` : `No accounts`}
                    />
                  )}
                </TabPanel>
                <TabPanel flex={1} display={"flex"} flexDirection={"column"}>
                  {hasFilteredContacts ? (
                    <CellStack px={0} pt={2}>
                      {filteredContacts.map((contact) => (
                        <AccountListItem
                          key={contact.id}
                          avatarSize={9}
                          accountAddress={contact.address}
                          networkId={contact.networkId}
                          accountName={contact.name}
                          onClick={() => onContactClick(contact)}
                        />
                      ))}
                    </CellStack>
                  ) : (
                    <Empty
                      icon={hasQuery ? <SearchIcon /> : <AddressBookIcon />}
                      title={
                        hasQuery
                          ? `No matching addresses`
                          : `No saved addresses`
                      }
                    />
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          )}
        </CellStack>
      </NavigationContainer>
      <SendModalAddContactScreen
        contact={{ address: query, networkId: switcherNetworkId }}
        isOpen={isAddContactOpen}
        onClose={onCloseAddContact}
        finalFocusRef={inputRef}
        onSave={onSaveContact}
      />
    </>
  )
}
