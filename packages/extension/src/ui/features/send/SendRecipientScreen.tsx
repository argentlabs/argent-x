import {
  BarAddButton,
  BarBackButton,
  Button,
  CellStack,
  Empty,
  FieldError,
  H6,
  HeaderCell,
  NavigationContainer,
  TextareaAutosize,
  icons,
} from "@argent/x-ui"
import {
  Flex,
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

import { addressInputCharactersAndLengthSchema } from "@argent/x-shared"
import { isEmpty } from "lodash-es"
import type { AddressBookContact } from "../../../shared/addressBook/type"
import type { WalletAccount } from "../../../shared/wallet.model"
import { useAutoFocusInputRef } from "../../hooks/useAutoFocusInputRef"
import { AccountListItem } from "../accounts/AccountListItem"
import { AccountListWithBalance } from "./AccountListWithBalance"
import { SendModalAddContactScreen } from "./SendModalAddContactScreen"
import { FormType } from "./sendRecipientScreen.model"

const { SearchIcon, WalletIcon, AddressBookIcon, CloseIcon, MultisigIcon } =
  icons

interface SendRecipientScreenProps {
  errors: FieldErrors<FormType>
  hasAccounts?: boolean
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
  multisigAccounts: WalletAccount[]
  standardAccounts: WalletAccount[]
}

export const SendRecipientScreen: FC<SendRecipientScreenProps> = ({
  errors,
  hasAccounts,
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
  multisigAccounts,
  standardAccounts,
}) => {
  const { ref, onChange, ...rest } = register("query")
  const inputRef = useAutoFocusInputRef<HTMLTextAreaElement>()

  const hasFilteredContacts = filteredContacts.length > 0

  const hasMultisigAccounts = !isEmpty(multisigAccounts)
  const hasStandardAccounts = !isEmpty(standardAccounts)
  const hasMultipleAccountTypes = hasStandardAccounts && hasMultisigAccounts
  const hasOnlyMultisigAccounts = hasMultisigAccounts && !hasStandardAccounts

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
                data-testid="recipient-input"
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
                  {hasMultipleAccountTypes ? (
                    <>
                      <Flex
                        gap={2}
                        align="center"
                        color="neutrals.300"
                        px={2}
                        pt={4}
                      >
                        <WalletIcon w={4} h={4} />
                        <H6>Standard Accounts</H6>
                      </Flex>
                      <AccountListWithBalance
                        accounts={standardAccounts}
                        onAccountClick={onAccountClick}
                      />

                      <Flex gap={2} align="center" color="neutrals.300" px={2}>
                        <MultisigIcon w={4} h={4} />
                        <H6>Multisig Accounts</H6>
                      </Flex>
                      <AccountListWithBalance
                        accounts={multisigAccounts}
                        onAccountClick={onAccountClick}
                      />
                    </>
                  ) : hasOnlyMultisigAccounts ? (
                    <AccountListWithBalance
                      accounts={multisigAccounts}
                      onAccountClick={onAccountClick}
                    />
                  ) : hasStandardAccounts ? (
                    <AccountListWithBalance
                      accounts={standardAccounts}
                      onAccountClick={onAccountClick}
                    />
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
