import { Link } from "react-router-dom"
import styled, { css } from "styled-components"

export const H1 = styled.h1`
  font-weight: bold;
  font-size: 40px;
  text-align: center;
  color: ${({ theme }) => theme.text1};
  margin: 12px 0;
`

export const H2 = styled.h2`
  font-weight: bold;
  font-size: 34px;
  line-height: 41px;
  color: ${({ theme }) => theme.text1};
  margin: 0 0 16px 0;
`

export const H3 = styled.h3`
  font-weight: bold;
  font-size: 22px;
  line-height: 28px;
  color: ${({ theme }) => theme.text1};
`

export const H4 = styled.h4`
  font-weight: bold;
  font-size: 20px;
  line-height: 25px;
  color: ${({ theme }) => theme.text1};
`

export const H5 = styled.h5`
  font-weight: 600;
  font-size: 17px;
  line-height: 22px;
  color: ${({ theme }) => theme.text1};
`

export const P = styled.p`
  font-size: 16px;
  line-height: 19px;
  color: ${({ theme }) => theme.text1};
`

export const P3 = styled.p`
  font-size: 16px;
  line-height: 19px;
  color: ${({ theme }) => theme.neutrals100};
`

export const DialogMessageText = styled.p`
  font-weight: 400;
  font-size: 13px;
  line-height: 18px;
  color: ${({ theme }) => theme.text1};
  text-align: center;
`

export const FormError = styled.p`
  margin-top: 2px;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.red2};
  text-align: left;
`

export const FormErrorAlt = styled.p`
  font-weight: 400;
  font-size: 13px;
  line-height: 18px;
  color: ${({ theme }) => theme.red1};
  margin-top: 8px;
  margin-left: 8px;
  text-align: left;
`

const anchorCss = css`
  display: inline-block;
  text-decoration: none;
  color: ${({ theme }) => theme.blue1};
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
  transition: all 200ms ease-in-out;

  &:visited {
    color: ${({ theme }) => theme.blue1};
  }

  &:hover {
    color: ${({ theme }) => theme.blue2};
    outline: 0;
    border: 0;
  }
  &:focus {
    background: rgba(255, 255, 255, 0.15);
    color: ${({ theme }) => theme.blue2};
    outline: 0;
    border: 0;
  }
`

export const A = styled.a`
  ${anchorCss}
`

export const StyledLink = styled(Link)`
  ${anchorCss}
`
