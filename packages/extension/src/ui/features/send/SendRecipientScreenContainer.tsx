import {
  addressInputSchema,
  addressOrDomainInputSchema,
  isStarknetDomainName,
  normalizeAddressOrDomain,
} from "@argent/shared"
import { useDisclosure } from "@chakra-ui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { FC, useCallback, useEffect, useMemo } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"

import type { AddressBookContact } from "../../../shared/addressBook/type"
import type { WalletAccount } from "../../../shared/wallet.model"
import { accountsEqual } from "../../../shared/utils/accountsEqual"
import { useAppState } from "../../app.state"
import { useNavigateReturnToOrBack } from "../../hooks/useNavigateReturnTo"
import { routes, useCurrentPathnameWithQuery } from "../../routes"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { AccountAddressListItem } from "../accounts/AccountAddressListItem"
import { SendRecipientScreen } from "./SendRecipientScreen"
import { useSendQuery } from "./schema"
import { useFilteredAccounts } from "./useFilteredAccounts"
import { useFilteredContacts } from "./useFilteredContacts"
import { useGetAddressFromDomainNameInput } from "./useGetAddressFromDomainName"
import { IS_DEV } from "../../../shared/utils/dev"
import { FormType, formSchema } from "./sendRecipientScreen.model"

export const SendRecipientScreenContainer: FC = () => {
  const returnTo = useCurrentPathnameWithQuery()
  const { recipientAddress, tokenAddress, tokenId, amount } = useSendQuery()
  const {
    isOpen: isAddContactOpen,
    onOpen: onOpenAddContact,
    onClose: onCloseAddContact,
  } = useDisclosure()
  const account = useView(selectedAccountView)
  const { switcherNetworkId } = useAppState()

  const navigate = useNavigate()
  const {
    watch,
    setValue,
    register,
    reset,
    formState: { errors },
    handleSubmit,
    setError,
  } = useForm<FormType>({
    defaultValues: { query: recipientAddress || "" },
    resolver: zodResolver(formSchema),
  })
  const query = watch().query
  const hasQueryError = "query" in errors

  const {
    isLoading,
    error: starknetDomainError,
    result: starknetAddress,
    isValid: starknetAddressIsValid,
  } = useGetAddressFromDomainNameInput(query, switcherNetworkId)

  const selectAddress = useCallback(
    (address: string) => {
      const isStarknetDomainNameQuery = isStarknetDomainName(query)
      if (isStarknetDomainNameQuery && (isLoading || !starknetAddressIsValid)) {
        return
      }
      navigate(
        routes.sendAmountAndAssetScreen({
          recipientAddress: address,
          tokenAddress,
          tokenId,
          amount,
          returnTo,
        }),
      )
    },
    [
      amount,
      isLoading,
      navigate,
      query,
      returnTo,
      starknetAddressIsValid,
      tokenAddress,
      tokenId,
    ],
  )

  const onSubmit: SubmitHandler<FormType> = useCallback(
    ({ query }) => {
      selectAddress(query)
    },
    [selectAddress],
  )

  const onAccountClick = (account: WalletAccount) => {
    selectAddress(account.address)
  }

  const onContactClick = (contact: AddressBookContact) => {
    selectAddress(contact.address)
  }

  const { accounts, filteredAccounts: allFilteredAccounts } =
    useFilteredAccounts(query)
  const { filteredContacts } = useFilteredContacts(query)

  const includeSelfAccount =
    Boolean(IS_DEV) /** Boolean guards against minification error */

  const filteredAccounts = includeSelfAccount
    ? allFilteredAccounts
    : allFilteredAccounts.filter((a) => !accountsEqual(a, account))

  /** > 1 because excluding current account */
  const hasAccounts = includeSelfAccount
    ? accounts.length > 0
    : accounts.length > 1

  useEffect(() => {
    if (starknetDomainError) {
      setError("query", {
        type: "custom",
        message: starknetDomainError,
      })
    }
  }, [setError, starknetDomainError])

  useEffect(() => {
    if (starknetAddressIsValid) {
      /** reset form state with validated starknet id */
      reset({ query }, { keepValues: true })
    }
  }, [query, reset, starknetAddress, starknetAddressIsValid])

  const placeholderValidAddress = useMemo(() => {
    const isStarknetDomainNameQuery = isStarknetDomainName(query)
    if (
      !addressOrDomainInputSchema.safeParse(query).success ||
      (isStarknetDomainNameQuery && isLoading) ||
      (isStarknetDomainNameQuery && !starknetAddressIsValid)
    ) {
      return null
    }

    return (
      <AccountAddressListItem
        accountAddress={query}
        onClick={handleSubmit(onSubmit)}
        truncated
      />
    )
  }, [handleSubmit, isLoading, onSubmit, query, starknetAddressIsValid])

  const onSaveContact = ({ address }: AddressBookContact) => {
    setValue("query", normalizeAddressOrDomain(address), {
      shouldDirty: true,
      shouldValidate: true,
    })
    onCloseAddContact()
  }

  const onBack = useNavigateReturnToOrBack()

  const onClearQuery = () => {
    /** reset form query, validation state */
    reset({ query: "" })
  }

  const onQuerySubmit = handleSubmit(onSubmit)

  /** auto-submit */
  const onQueryPaste = useCallback(
    (queryPaste: string) => {
      /** only if pasting into empty field */
      if (query !== "") {
        return
      }
      /** ignore starknet id or invalid address */
      if (!addressInputSchema.safeParse(queryPaste).success) {
        return
      }
      selectAddress(queryPaste)
    },
    [query, selectAddress],
  )

  if (!account) {
    return null
  }

  return (
    <SendRecipientScreen
      errors={errors}
      hasAccounts={hasAccounts}
      filteredAccounts={filteredAccounts}
      filteredContacts={filteredContacts}
      hasQueryError={hasQueryError}
      isLoading={isLoading}
      isAddContactOpen={isAddContactOpen}
      onAccountClick={onAccountClick}
      onBack={onBack}
      onClearQuery={onClearQuery}
      onCloseAddContact={onCloseAddContact}
      onContactClick={onContactClick}
      onOpenAddContact={onOpenAddContact}
      onQuerySubmit={onQuerySubmit}
      onSaveContact={onSaveContact}
      onQueryPaste={onQueryPaste}
      placeholderValidAddress={placeholderValidAddress}
      query={query}
      register={register}
      switcherNetworkId={switcherNetworkId}
    />
  )
}
