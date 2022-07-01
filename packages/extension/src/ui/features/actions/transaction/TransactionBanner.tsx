import React, { FC } from "react"
import styled from "styled-components"

import { ApiTransactionReviewAssessment } from "../../../../shared/transactionReview.service"

type Variant = ApiTransactionReviewAssessment | undefined

interface IContainer {
  variant: ApiTransactionReviewAssessment | undefined
}

export const getVariantColor = ({ variant }: IContainer) => {
  switch (variant) {
    case "warn":
      return "#f36a3d"
  }
  return "#02A697"
}

const Container = styled.div<IContainer>`
  background-color: ${getVariantColor};
  color: white;
  font-size: 13px;
  font-weight: 600;
  line-height: 18px;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: row;
`

const IconContainer = styled.div`
  margin-right: 8px;
  svg {
    font-size: inherit;
    height: 18px; /** ensures icon is visually centered with first line of text at 18px line height */
  }
`

export interface ITransactionBanner {
  variant: Variant
  icon: FC
  message: string
}

export const TransactionBanner: FC<ITransactionBanner> = ({
  variant,
  icon: Icon,
  message,
}) => {
  return (
    <Container variant={variant}>
      <IconContainer>
        <Icon />
      </IconContainer>
      {message}
    </Container>
  )
}
