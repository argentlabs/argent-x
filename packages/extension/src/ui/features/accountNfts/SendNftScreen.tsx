import { BigNumber } from "ethers"
import { FC, lazy } from "react"
import { useForm } from "react-hook-form"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import styled from "styled-components"
import { Schema, object } from "yup"

import Column, { ColumnCenter } from "../../components/Column"
import { IconBar } from "../../components/IconBar"
import { AtTheRateIcon } from "../../components/Icons/AtTheRateIcon"
import { StyledControlledInput } from "../../components/InputText"
import { RowCentered } from "../../components/Row"
import { H3 } from "../../components/Typography"
import { routes } from "../../routes"
import { addressSchema } from "../../services/addresses"
import {
  getUint256CalldataFromBN,
  sendTransaction,
} from "../../services/transactions"
import { useSelectedAccount } from "../accounts/accounts.state"
import {
  FormError,
  InputGroupAfter,
  NextButton,
} from "../accountTokens/SendTokenScreen"
import { TokenMenu } from "../accountTokens/TokenMenu"
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

  const {
    handleSubmit,
    formState: { errors, isDirty, isSubmitting, submitCount },
    control,
  } = useForm<SendNftInput>({
    defaultValues: {
      recipient: "",
    },
    resolver,
  })

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
                style={{ paddingRight: "40px" }}
              >
                <InputGroupAfter>
                  <AtTheRateIcon />
                </InputGroupAfter>
              </StyledControlledInput>
              {errors.recipient && (
                <FormError>{errors.recipient.message}</FormError>
              )}
            </div>
          </Column>
          <NextButton type="submit" disabled={disableSubmit}>
            Next
          </NextButton>
        </StyledForm>
      </ColumnCenter>
    </>
  )
}
