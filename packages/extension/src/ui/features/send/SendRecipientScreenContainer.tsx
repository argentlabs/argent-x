import {
  addressInputSchema,
  addressOrDomainInputSchema,
  normalizeAddressOrDomain,
} from "@argent/x-shared"
import { starknetId } from "starknet"
import { useDisclosure } from "@chakra-ui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { FC } from "react"
import { useCallback, useEffect, useMemo } from "react"
import type { SubmitHandler } from "react-hook-form"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"

import type { AddressBookContact } from "../../../shared/addressBook/type"
import { accountsEqual } from "../../../shared/utils/accountsEqual"
import { IS_DEV } from "../../../shared/utils/dev"
import type { WalletAccount } from "../../../shared/wallet.model"
import { useNavigateReturnToOrBack } from "../../hooks/useNavigateReturnTo"
import { useCurrentPathnameWithQuery } from "../../hooks/useRoute"
import { routes } from "../../../shared/ui/routes"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { AccountAddressListItem } from "../accounts/AccountAddressListItem"
import { SendRecipientScreen } from "./SendRecipientScreen"
import { useSendQuery } from "./useSendQuery"
import type { FormType } from "./sendRecipientScreen.model"
import { formSchema } from "./sendRecipientScreen.model"
import { useFilteredAccounts } from "./useFilteredAccounts"
import { useFilteredContacts } from "./useFilteredContacts"
import { useGetAddressFromDomainNameInput } from "./useGetAddressFromDomainName"
import { selectedNetworkIdView } from "../../views/network"
import { usePartitionedAccountsByType } from "../accounts/usePartitionedAccountsByType"

export const SendRecipientScreenContainer: FC = () => {
  const returnTo = useCurrentPathnameWithQuery()
  const { recipientAddress, tokenAddress, tokenId, amount } = useSendQuery()
  const {
    isOpen: isAddContactOpen,
    onOpen: onOpenAddContact,
    onClose: onCloseAddContact,
  } = useDisclosure()
  const account = useView(selectedAccountView)
  const selectedNetworkId = useView(selectedNetworkIdView)

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
  } = useGetAddressFromDomainNameInput(query, selectedNetworkId)

  const selectAddress = useCallback(
    (address: string) => {
      const isStarknetDomainNameQuery = starknetId.isStarkDomain(query)
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

  const onEditContactClick = (contact: AddressBookContact) => {
    navigate(routes.sendAddressBookEdit(contact))
  }

  const { accounts, filteredAccounts: allFilteredAccounts } =
    useFilteredAccounts(query)
  const { filteredContacts } = useFilteredContacts(query)

  const includeSelfAccount =
    Boolean(IS_DEV) /** Boolean guards against minification error */

  /** > 1 because excluding current account */
  const hasAccounts = includeSelfAccount
    ? accounts.length > 0
    : accounts.length > 1

  const { multisigAccounts, importedAccounts, standardAccounts } =
    usePartitionedAccountsByType(allFilteredAccounts)

  const conditionalStandardAccounts = useMemo(() => {
    return includeSelfAccount
      ? standardAccounts
      : standardAccounts.filter((a) => !accountsEqual(a, account))
  }, [standardAccounts, includeSelfAccount, account])

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
    const isStarknetDomainNameQuery = starknetId.isStarkDomain(query)
    if (
      !addressOrDomainInputSchema.safeParse(query).success ||
      (isStarknetDomainNameQuery && isLoading) ||
      (isStarknetDomainNameQuery && !starknetAddressIsValid) ||
      (!isStarknetDomainNameQuery && query.includes("."))
    ) {
      return null
    }

    return (
      <AccountAddressListItem
        accountAddress={query}
        /* eslint-disable-next-line @typescript-eslint/no-misused-promises */
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
      if (!addressInputSchema.safeParse(queryPaste).success) {
        /** submit and validate so the user will see error in the UI */
        return onQuerySubmit()
      }
      selectAddress(queryPaste)
    },
    [onQuerySubmit, query, selectAddress],
  )

  if (!account) {
    return null
  }

  return (
    <SendRecipientScreen
      errors={errors}
      hasAccounts={hasAccounts}
      multisigAccounts={multisigAccounts}
      standardAccounts={conditionalStandardAccounts}
      importedAccounts={importedAccounts}
      filteredContacts={filteredContacts}
      hasQueryError={hasQueryError}
      isLoading={isLoading}
      isAddContactOpen={isAddContactOpen}
      onAccountClick={onAccountClick}
      onBack={onBack}
      onClearQuery={onClearQuery}
      onCloseAddContact={onCloseAddContact}
      onContactClick={onContactClick}
      onEditContactClick={onEditContactClick}
      onOpenAddContact={onOpenAddContact}
      onQuerySubmit={() => void onQuerySubmit()}
      onSaveContact={onSaveContact}
      onQueryPaste={(queryPaste) => void onQueryPaste(queryPaste)}
      placeholderValidAddress={placeholderValidAddress}
      query={query}
      register={register}
      selectedNetworkId={selectedNetworkId}
    />
  )
}
