import { BigNumber } from "ethers"
import { FC, lazy } from "react"
import { useForm } from "react-hook-form"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import styled from "styled-components"
import { Schema, object } from "yup"

import { ButtonGroup } from "../../components/Button"
import { ColumnCenter } from "../../components/Column"
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
import { TokenMenu } from "../accountTokens/TokenMenu"
import { useYupValidationResolver } from "../settings/useYupValidationResolver"
import { useNfts } from "./useNfts"

const LazyNftModelViewer = lazy(() => import("./NftModelViewer"))

const StyledIconBar = styled(IconBar)`
  align-items: flex-start;
`

const FormContainer = styled(ColumnCenter)`
  padding: 24px;
`

const InputGroupAfter = styled.div`
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
`

export const FormError = styled.p`
  margin-top: 2px;
  font-size: 12px;
  line-height: 16px;
  color: #ff675c;
  text-align: left;
`

export const NftImageContainer = styled.div`
  width: 96px;
  margin-bottom: 24px;

  img {
    width: 100%;
    height: auto;
    border-radius: 8px;
  }
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
      <StyledIconBar
        back
        childAfter={<TokenMenu tokenAddress={nft.contract_address} />}
      >
        <H3>{nft.name}</H3>
      </StyledIconBar>

      <FormContainer>
        <RowCentered>
          <NftImageContainer>
            {nft.animation_url ? (
              <LazyNftModelViewer nft={nft} />
            ) : (
              <img src={nft.copy_image_url} alt={nft.name} />
            )}
          </NftImageContainer>
        </RowCentered>

        <ButtonGroup as="form" onSubmit={handleSubmit(onSubmit)}>
          <StyledControlledInput
            autoComplete="off"
            control={control}
            placeholder="Recipient's address"
            name="recipient"
            type="text"
          >
            <InputGroupAfter>
              <AtTheRateIcon />
            </InputGroupAfter>
          </StyledControlledInput>
          {errors.recipient && (
            <FormError>{errors.recipient.message}</FormError>
          )}
        </ButtonGroup>
      </FormContainer>
    </>
  )
}
