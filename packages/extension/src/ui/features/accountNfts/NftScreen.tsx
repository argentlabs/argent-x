import { BigNumber } from "ethers"
import { FC, lazy } from "react"
import { useForm } from "react-hook-form"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import styled from "styled-components"
import { Schema, object } from "yup"

import { Button, ButtonGroup } from "../../components/Button"
import { IconBar } from "../../components/IconBar"
import { ControlledInputText } from "../../components/InputText"
import { FormError } from "../../components/Typography"
import { routes } from "../../routes"
import { addressSchema } from "../../services/addresses"
import {
  getUint256CalldataFromBN,
  sendTransaction,
} from "../../services/transactions"
import { useSelectedAccount } from "../accounts/accounts.state"
import { useYupValidationResolver } from "../settings/useYupValidationResolver"
import { openAspectNft } from "./aspect.service"
import AspectSvg from "./aspect.svg"
import { useNfts } from "./useNfts"

const LazyNftModelViewer = lazy(() => import("./NftModelViewer"))

export const Container = styled.div`
  margin: 0 24px;

  h3 {
    font-weight: 700;
    font-size: 28px;
    line-height: 34px;
    margin-bottom: 16px;
  }

  img {
    width: 100%;
    border-radius: 8px;
  }

  a {
    color: white;
    font-size: 16px;
  }

  p {
    font-weight: 600;
    font-size: 15px;
    line-height: 20px;
    margin: 10px 0 15px 0;
  }

  .aspect {
    display: flex;
    align-items: center;
    width: inherit;
    font-size: 13px;
    line-height: 18px;
    padding: 8px;

    svg {
      width: 24px;
    }

    span {
      margin: 0 5px;
    }
  }

  ${ButtonGroup} {
    margin-top: 10px;
  }
`

export interface SendNftInput {
  recipient: string
}
export const SendNftSchema: Schema<SendNftInput> = object().required().shape({
  recipient: addressSchema,
})

export const NftScreen: FC = () => {
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
    control,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting, submitCount },
  } = useForm<SendNftInput>({
    resolver,
    defaultValues: {
      recipient: "",
    },
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
      <IconBar back />
      <Container>
        <h3>{nft.name}</h3>
        {nft.animation_url ? (
          <LazyNftModelViewer nft={nft} />
        ) : (
          <img src={nft.copy_image_url} alt={nft.name} />
        )}
        <p>{nft.description}</p>
        <Button
          className="aspect"
          onClick={() => openAspectNft(nft.contract_address, nft.token_id)}
        >
          <AspectSvg /> <span>View on Aspect</span>
        </Button>

        <ButtonGroup as="form" onSubmit={handleSubmit(onSubmit)}>
          <ControlledInputText
            autoComplete="off"
            control={control}
            placeholder="Recipient"
            name="recipient"
            type="text"
          />
          {errors.recipient && (
            <FormError>{errors.recipient.message}</FormError>
          )}
          <Button disabled={disableSubmit} type="submit">
            Send
          </Button>
        </ButtonGroup>
      </Container>
    </>
  )
}
