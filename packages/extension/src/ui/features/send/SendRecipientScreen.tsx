import {
  BarAddButton,
  BarBackButton,
  Button,
  CellStack,
  Empty,
  FieldError,
  H5,
  HeaderCell,
  icons,
  NavigationContainer,
  TextareaAutosize,
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
import type { BaseSyntheticEvent, FC, ReactNode } from "react"
import type { FieldErrors, UseFormRegister } from "react-hook-form"

import { addressInputCharactersAndLengthSchema } from "@argent/x-shared"
import { isEmpty } from "lodash-es"
import type { AddressBookContact } from "../../../shared/addressBook/type"
import type { WalletAccount } from "../../../shared/wallet.model"
import { useAutoFocusInputRef } from "../../hooks/useAutoFocusInputRef"
import { AccountListItem } from "../accounts/AccountListItem"
import { AccountListWithBalance } from "./AccountListWithBalance"
import { SendModalAddContactScreen } from "./SendModalAddContactScreen"
import type { FormType } from "./sendRecipientScreen.model"
import { AccountListItemEditAccessory } from "../accounts/AccountListItemEditAccessory"
import { useTabIndexWithHash } from "../../hooks/useTabIndexWithHash"

const {
  SearchPrimaryIcon,
  WalletSecondaryIcon,
  CrossSecondaryIcon,
  MultisigSecondaryIcon,
  AddressBookIcon,
  ImportIcon,
} = icons

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
  onEditContactClick: (contact: AddressBookContact) => void
  onOpenAddContact: () => void
  onQuerySubmit: (e?: BaseSyntheticEvent) => void
  onSaveContact: (contact: AddressBookContact) => void
  onQueryPaste: (query: string) => void
  placeholderValidAddress: ReactNode
  query: string
  register: UseFormRegister<FormType>
  selectedNetworkId: string
  multisigAccounts: WalletAccount[]
  standardAccounts: WalletAccount[]
  importedAccounts: WalletAccount[]
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
  onEditContactClick,
  onOpenAddContact,
  onQuerySubmit,
  onSaveContact,
  onQueryPaste,
  placeholderValidAddress,
  query,
  register,
  selectedNetworkId,
  multisigAccounts,
  importedAccounts,
  standardAccounts,
}) => {
  const { ref, onChange, ...rest } = register("query")
  const inputRef = useAutoFocusInputRef<HTMLTextAreaElement>()

  const hasFilteredContacts = filteredContacts.length > 0

  const hasMultisigAccounts = !isEmpty(multisigAccounts)
  const hasStandardAccounts = !isEmpty(standardAccounts)
  const hasImportedAccounts = !isEmpty(importedAccounts)
  const hasMultipleAccountTypes =
    [hasStandardAccounts, hasMultisigAccounts, hasImportedAccounts].filter(
      Boolean,
    ).length > 1
  const hasOnlyMultisigAccounts = hasMultisigAccounts && !hasStandardAccounts

  const hasQuery = Boolean(query)

  const defaultTabIndex = hasAccounts ? 0 : 1
  const [tabIndex, setTabIndex] = useTabIndexWithHash(
    ["my-accounts", "address-book"],
    defaultTabIndex,
  )

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
              <InputLeftElement pointerEvents="none">
                <SearchPrimaryIcon />
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
                    void onChange(e)
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
                    <CrossSecondaryIcon />
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
              index={tabIndex}
              onChange={setTabIndex}
            >
              <TabList mx={-4}>
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
                        <WalletSecondaryIcon w={4} h={4} />
                        <H5>My Accounts</H5>
                      </Flex>
                      <AccountListWithBalance
                        accounts={standardAccounts}
                        onAccountClick={onAccountClick}
                      />
                      {hasMultisigAccounts && (
                        <>
                          <Flex
                            gap={2}
                            align="center"
                            color="neutrals.300"
                            px={2}
                          >
                            <MultisigSecondaryIcon w={4} h={4} />
                            <H5>Multisig Accounts</H5>
                          </Flex>
                          <AccountListWithBalance
                            accounts={multisigAccounts}
                            onAccountClick={onAccountClick}
                          />
                        </>
                      )}
                      {hasImportedAccounts && (
                        <>
                          <Flex
                            gap={2}
                            align="center"
                            color="neutrals.300"
                            px={2}
                          >
                            <ImportIcon w={4} h={4} />
                            <H5>Imported Accounts</H5>
                          </Flex>
                          <AccountListWithBalance
                            accounts={importedAccounts}
                            onAccountClick={onAccountClick}
                          />
                        </>
                      )}
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
                  ) : hasImportedAccounts ? (
                    <AccountListWithBalance
                      accounts={importedAccounts}
                      onAccountClick={onAccountClick}
                    />
                  ) : (
                    <Empty
                      icon={
                        hasQuery ? (
                          <SearchPrimaryIcon />
                        ) : (
                          <WalletSecondaryIcon />
                        )
                      }
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
                          accountId={contact.id}
                          networkId={contact.networkId}
                          accountName={contact.name}
                          onClick={() => onContactClick(contact)}
                        >
                          <AccountListItemEditAccessory
                            data-testid={`edit-contact-${contact.id}`}
                            onClick={() => onEditContactClick(contact)}
                          />
                        </AccountListItem>
                      ))}
                    </CellStack>
                  ) : (
                    <Empty
                      icon={
                        hasQuery ? <SearchPrimaryIcon /> : <AddressBookIcon />
                      }
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
        contact={{ address: query, networkId: selectedNetworkId }}
        isOpen={isAddContactOpen}
        onClose={onCloseAddContact}
        finalFocusRef={inputRef}
        onSave={onSaveContact}
      />
    </>
  )
}
