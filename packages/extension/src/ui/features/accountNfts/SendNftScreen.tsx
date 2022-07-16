import { BigNumber } from "ethers"
import { FC, lazy, useState } from "react"
import { useForm } from "react-hook-form"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import styled from "styled-components"
import { Schema, object } from "yup"

import { Button } from "../../components/Button"
import Column, { ColumnCenter } from "../../components/Column"
import { IconBar } from "../../components/IconBar"
import { AtTheRateIcon } from "../../components/Icons/AtTheRateIcon"
import { StyledControlledInput } from "../../components/InputText"
import { RowCentered } from "../../components/Row"
import { routes } from "../../routes"
import { useAddressBook } from "../../services/addressBook"
import { addressSchema, normalizeAddress } from "../../services/addresses"
import {
  getUint256CalldataFromBN,
  sendTransaction,
} from "../../services/transactions"
import { H3 } from "../../theme/Typography"
import { useSelectedAccount } from "../accounts/accounts.state"
import { AddressBookMenu } from "../accounts/AddressBookMenu"
import {
  AtTheRateWrapper,
  FormError,
  InputGroupAfter,
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

  const {
    handleSubmit,
    formState: { errors, isDirty, isSubmitting, submitCount },
    control,
    setValue,
  } = useForm<SendNftInput>({
    defaultValues: {
      recipient: "",
    },
    resolver,
  })

  const [addressBookOpen, setAddressBookOpen] = useState(false)

  const addressBook = useAddressBook(
    account?.networkId || currentNetworkId,
    account ? [account] : [],
  )

  if (!account || !nft || !contractAddress || !tokenId) {
    return <Navigate to={routes.accounts()} />
  }

  const handleAddressSelect = (address: string) => {
    setValue("recipient", normalizeAddress(address))
    setAddressBookOpen(false)
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
              <StyledControlledInput
                autoComplete="off"
                control={control}
                placeholder="Recipient's address"
                name="recipient"
                type="text"
                style={{
                  paddingRight: "50px",
                  borderRadius: addressBookOpen ? "8px 8px 0 0" : "8px",
                }}
              >
                <>
                  <InputGroupAfter>
                    <AtTheRateWrapper
                      type="button"
                      onClick={() => setAddressBookOpen(!addressBookOpen)}
                      active={addressBookOpen}
                    >
                      <AtTheRateIcon />
                    </AtTheRateWrapper>
                  </InputGroupAfter>

                  {addressBookOpen && (
                    <AddressBookMenu
                      addressBook={addressBook}
                      onAddressSelect={handleAddressSelect}
                    />
                  )}
                </>
              </StyledControlledInput>
              {errors.recipient && (
                <FormError>{errors.recipient.message}</FormError>
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
