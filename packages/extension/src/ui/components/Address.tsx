import styled from "styled-components"

export const AccountName = styled.h1`
  font-style: normal;
  font-weight: 700;
  font-size: 22px;
  line-height: 28px;
  margin: 32px 0 16px 0;
`

export const AccountAddress = styled.p`
  font-style: normal;
  font-weight: 400;
  font-size: 17px;
  line-height: 22px;
  word-spacing: 5px;
  color: ${({ theme }) => theme.text2};
`
