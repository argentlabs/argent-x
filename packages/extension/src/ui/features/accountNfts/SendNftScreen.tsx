import { BigNumber } from "ethers"
import { FC, lazy, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import styled from "styled-components"
import { Schema, object } from "yup"

import { AddressBookContact } from "../../../shared/addressBook"
import { Button } from "../../components/Button"
import Column, { ColumnCenter } from "../../components/Column"
import { IconBar } from "../../components/IconBar"
import { AtTheRateIcon } from "../../components/Icons/AtTheRateIcon"
import { CloseIconAlt } from "../../components/Icons/CloseIconAlt"
import { AddIcon } from "../../components/Icons/MuiIcons"
import { StyledControlledTextArea } from "../../components/InputText"
import Row, { RowBetween, RowCentered } from "../../components/Row"
import { routes } from "../../routes"
import { makeClickable } from "../../services/a11y"
import { useAddressBook } from "../../services/addressBook"
import {
  addressSchema,
  formatTruncatedAddress,
  normalizeAddress,
} from "../../services/addresses"
import {
  getUint256CalldataFromBN,
  sendTransaction,
} from "../../services/transactions"
import { H3, H5 } from "../../theme/Typography"
import { Account } from "../accounts/Account"
import {
  getAccountName,
  useAccountMetadata,
} from "../accounts/accountMetadata.state"
import { getAccountImageUrl } from "../accounts/accounts.service"
import { useSelectedAccount } from "../accounts/accounts.state"
import { AddressBookMenu } from "../accounts/AddressBookMenu"
import { ProfilePicture } from "../accounts/ProfilePicture"
import {
  AddressBookRecipient,
  AtTheRateWrapper,
  FormError,
  InputGroupAfter,
  SaveAddressButton,
  StyledAccountAddress,
} from "../accountTokens/SendTokenScreen"
import { TokenMenu } from "../accountTokens/TokenMenu"
import { useCurrentNetwork } from "../networks/useNetworks"
import { useYupValidationResolver } from "../settings/useYupValidationResolver"
import { useNfts } from "./useNfts"

const LazyNftModelViewer = lazy(() => import("./NftModelViewer"))

export const NftImageContainer = styled.div`
  width: 96px;
  margin-bottom: 12px;

  img {
    width: 100%;
    height: auto;
    border-radius: 8px;
  }
`
export const StyledForm = styled.form`
  padding: 24px;
  height: 87vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
`
export interface SendNftInput {
  recipient: string
}
export const SendNftSchema: Schema<SendNftInput> = object().required().shape({
  recipient: addressSchema,
})

export const SendNftScreen: FC = () => {
  const navigate = useNavigate()
  const { contractAddress, tokenId } = useParams()
  const account = useSelectedAccount()

  const { nfts = [] } = useNfts(account)
  const nft = nfts.find(
    ({ contract_address, token_id }) =>
      contract_address === contractAddress && token_id === tokenId,
  )
  const resolver = useYupValidationResolver(SendNftSchema)

  const { id: currentNetworkId } = useCurrentNetwork()
  const [addressBookRecipient, setAddressBookRecipient] = useState<
    Account | AddressBookContact
  >()

  const { accountNames } = useAccountMetadata()

  const accountName = useMemo(
    () =>
      addressBookRecipient
        ? "name" in addressBookRecipient
          ? addressBookRecipient.name
          : getAccountName(addressBookRecipient, accountNames)
        : undefined,
    [accountNames, addressBookRecipient],
  )

  const {
    handleSubmit,
    formState: { errors, isDirty, isSubmitting, submitCount },
    control,
    setValue,
    watch,
  } = useForm<SendNftInput>({
    defaultValues: {
      recipient: "",
    },
    resolver,
  })

  const formValues = watch()
  const inputRecipient = formValues.recipient
  const validStarknetAddress =
    inputRecipient.length > 62 && inputRecipient.length <= 66 // including 0x

  const showSaveAddressButton = validStarknetAddress
  const [addressBookOpen, setAddressBookOpen] = useState(false)

  const addressBook = useAddressBook(account?.networkId || currentNetworkId)

  if (!account || !nft || !contractAddress || !tokenId) {
    return <Navigate to={routes.accounts()} />
  }

  const disableSubmit = isSubmitting || (submitCount > 0 && !isDirty)

  const onSubmit = async ({ recipient }: SendNftInput) => {
    sendTransaction({
      to: contractAddress,
      method: "transferFrom",
      calldata: {
        from_: account.address,
        to: recipient,
        tokenId: getUint256CalldataFromBN(BigNumber.from(tokenId)),
      },
    })

    navigate(routes.accountActivity())
  }

  const handleAddressSelect = (account: Account | AddressBookContact) => {
    setAddressBookRecipient(account)
    setValue("recipient", normalizeAddress(account.address))
    setAddressBookOpen(false)
  }

  const resetAddressBookRecipient = () => {
    setAddressBookRecipient(undefined)
    setValue("recipient", "")
  }

  return (
    <>
      <IconBar
        back
        childAfter={<TokenMenu tokenAddress={nft.contract_address} />}
      >
        <H3>{nft.name}</H3>
      </IconBar>

      <ColumnCenter>
        <StyledForm onSubmit={handleSubmit(onSubmit)}>
          <Column gap="12px">
            <RowCentered>
              <NftImageContainer>
                {nft.animation_uri ? (
                  <LazyNftModelViewer nft={nft} />
                ) : (
                  <img src={nft.image_url_copy} alt={nft.name} />
                )}
              </NftImageContainer>
            </RowCentered>
            <div>
              {addressBookRecipient && accountName ? (
                <AddressBookRecipient>
                  <RowBetween>
                    <Row gap="16px">
                      <ProfilePicture
                        src={getAccountImageUrl(
                          accountName,
                          addressBookRecipient,
                        )}
                        width="40px"
                        height="40px"
                      />

                      <Column>
                        <H5>{accountName}</H5>
                        <StyledAccountAddress>
                          {formatTruncatedAddress(addressBookRecipient.address)}
                        </StyledAccountAddress>
                      </Column>
                    </Row>
                    <CloseIconAlt
                      {...makeClickable(resetAddressBookRecipient)}
                      style={{ cursor: "pointer" }}
                    />
                  </RowBetween>
                </AddressBookRecipient>
              ) : (
                <>
                  <StyledControlledTextArea
                    autoComplete="off"
                    control={control}
                    placeholder="Recipient's address"
                    name="recipient"
                    maxRows={3}
                    style={{
                      paddingRight: "50px",
                      borderRadius: addressBookOpen ? "8px 8px 0 0" : "8px",
                    }}
                  >
                    <>
                      <InputGroupAfter>
                        {validStarknetAddress ? (
                          <CloseIconAlt
                            {...makeClickable(resetAddressBookRecipient)}
                            style={{ cursor: "pointer" }}
                          />
                        ) : (
                          <AtTheRateWrapper
                            type="button"
                            active={addressBookOpen}
                            {...makeClickable(() =>
                              setAddressBookOpen(!addressBookOpen),
                            )}
                          >
                            <AtTheRateIcon />
                          </AtTheRateWrapper>
                        )}
                      </InputGroupAfter>

                      {addressBookOpen && (
                        <AddressBookMenu
                          addressBook={addressBook}
                          onAddressSelect={handleAddressSelect}
                        />
                      )}
                    </>
                  </StyledControlledTextArea>
                  {showSaveAddressButton && (
                    <SaveAddressButton type="button">
                      <AddIcon fill="#29C5FF" style={{ fontSize: "15px" }} />
                      Save address
                    </SaveAddressButton>
                  )}
                  {errors.recipient && (
                    <FormError>{errors.recipient.message}</FormError>
                  )}
                </>
              )}
            </div>
          </Column>
          <Button type="submit" disabled={disableSubmit}>
            Next
          </Button>
        </StyledForm>
      </ColumnCenter>
    </>
  )
}
