import { FC, ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { CloseIcon } from "../../components/Icons/CloseIcon"

export const HeadContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 20px 18px;
`

export const CloseIconWrapper = styled.div`
  cursor: pointer;
`

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 16px 0px;
  margin-bottom: 24px;
`

export const Title = styled.div`
  font-weight: 700;
  font-size: 28px;
  line-height: 34px;
  margin-bottom: 17.5px;
  text-align: left;
  padding-left: 8px;
`

interface ITransactionDetailWrapper {
  title?: ReactNode
  children: ReactNode
}

export const TransactionDetailWrapper: FC<ITransactionDetailWrapper> = ({
  title = "Transaction",
  children,
}) => {
  const navigate = useNavigate()
  return (
    <>
      <HeadContainer>
        <CloseIconWrapper onClick={() => navigate(-1)}>
          <CloseIcon />
        </CloseIconWrapper>
      </HeadContainer>
      <Container>
        <Title>{title}</Title>
        {children}
      </Container>
    </>
  )
}
